
import { google } from "googleapis";

export type DriveMedia = {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
};

export type Album = {
  id: string;
  name: string;
  createdTime?: string;
  modifiedTime?: string;
  photos: DriveMedia[];
};

function driveClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!raw) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON belum diatur.");
  }

  let credentials;

  try {
    credentials = JSON.parse(raw);
  } catch {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON harus berupa JSON valid satu baris."
    );
  }

  if (
    credentials.type !== "service_account" ||
    !credentials.client_email ||
    !credentials.private_key
  ) {
    throw new Error("Kredensial Service Account tidak lengkap.");
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  return google.drive({
    version: "v3",
    auth,
  });
}

export async function getAlbums(): Promise<Album[]> {
  const drive = driveClient();
  const rootId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

  if (!rootId) {
    throw new Error("GOOGLE_DRIVE_ROOT_FOLDER_ID belum diatur.");
  }

  const albums: Album[] = [];

  let folderPageToken: string | undefined;

  do {
    const folders = await drive.files.list({
      q: [
        `'${rootId}' in parents`,
        "mimeType = 'application/vnd.google-apps.folder'",
        "trashed = false",
      ].join(" and "),
      fields: "nextPageToken,files(id,name,createdTime,modifiedTime)",
      orderBy: "name",
      pageSize: 1000,
      pageToken: folderPageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    for (const folder of folders.data.files ?? []) {
      if (!folder.id) continue;

      const photos: DriveMedia[] = [];
      let mediaPageToken: string | undefined;

      do {
        const media = await drive.files.list({
          q: [
            `'${folder.id}' in parents`,
            "trashed = false",
            "(mimeType contains 'image/' or mimeType contains 'video/')",
          ].join(" and "),
          fields: "nextPageToken,files(id,name,mimeType,createdTime)",
          orderBy: "createdTime",
          pageSize: 1000,
          pageToken: mediaPageToken,
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
        });

        for (const file of media.data.files ?? []) {
          if (!file.id || !file.name || !file.mimeType) continue;

          photos.push({
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            createdTime: file.createdTime ?? undefined,
          });
        }

        mediaPageToken = media.data.nextPageToken ?? undefined;
      } while (mediaPageToken);

      albums.push({
        id: folder.id,
        name: folder.name ?? "Untitled Album",
        createdTime: folder.createdTime ?? undefined,
        modifiedTime: folder.modifiedTime ?? undefined,
        photos,
      });
    }

    folderPageToken = folders.data.nextPageToken ?? undefined;
  } while (folderPageToken);

  return albums;
}

export async function getDriveMedia(fileId: string) {
  const drive = driveClient();

  const metadata = await drive.files.get({
    fileId,
    fields: "id,name,mimeType",
    supportsAllDrives: true,
  });

  const response = await drive.files.get(
    {
      fileId,
      alt: "media",
      supportsAllDrives: true,
    },
    {
      responseType: "stream",
    }
  );

  return {
    name: metadata.data.name ?? "media",
    mimeType: metadata.data.mimeType ?? "application/octet-stream",
    stream: response.data,
  };
}
