const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const archiver = require('archiver');
const crypto = require('crypto');

// Encryption parameters
const ENCRYPTION_KEY = Buffer.from('c3d0fdbda856efcdffd9edc78e2f9b88c3d0fdbda856efcdf3d9edc78e2f9b88', 'hex');
const IV = Buffer.from('5d1e34a42bdf65b8ab72f86d18abde7f', 'hex');

function encryptFile(inputPath, outputPath, key, iv) {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);

  return new Promise((resolve, reject) => {
    input.pipe(cipher).pipe(output).on('finish', resolve).on('error', reject);
  });
}


async function backupMongoDBAsEncryptedZip(uri, dbName, backupZipPath, encryptedBackupPath) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB for backup.');

    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();

    const output = fs.createWriteStream(backupZipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`Backup ZIP created: ${backupZipPath} (${archive.pointer()} bytes)`);
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);

    // Stream each collection into the ZIP
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const collection = db.collection(collectionName);

      const cursor = collection.find({});
      const chunks = [];

      await cursor.forEach((doc) => {
        chunks.push(doc);
        if (chunks.length >= 1000) {
          archive.append(JSON.stringify(chunks, null, 2), { name: `${collectionName}.json` });
          chunks.length = 0;
        }
      });

      if (chunks.length > 0) {
        archive.append(JSON.stringify(chunks, null, 2), { name: `${collectionName}.json` });
      }

      console.log(`Backed up collection: ${collectionName}`);
    }

    await archive.finalize();

    // Encrypt the ZIP file
    if (encryptedBackupPath) {
        await encryptFile(backupZipPath, encryptedBackupPath, ENCRYPTION_KEY, IV);
        console.log(`Encrypted backup saved to: ${encryptedBackupPath}`);
        //Clean up unencrypted file
        fs.unlinkSync(backupZipPath);
    }
  } catch (error) {
    console.error('Error during backup:', error);
  } finally {
    await client.close();
  }
}

const unzipper = require('unzipper');

// Decryption function
function decryptFile(inputPath, outputPath, key, iv) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);

  return new Promise((resolve, reject) => {
    input.pipe(decipher).pipe(output).on('finish', resolve).on('error', reject);
  });
}

const convertDocuments = (collectionName, documents) => {
  if (collectionName === 'equipment') {
    const documentWithDates = documents.map((obj, index) => {
      Object.assign(obj, {
          _id : new ObjectId(obj._id),
          user : obj.user ? new ObjectId(obj.user) : obj.user,
          owner : obj.owner ? new ObjectId(obj.owner) : obj.owner,
          createdAt : obj.createdAt ? new Date(obj.createdAt) : obj.createdAt,
          updatedAt : obj.updatedAt ? new Date(obj.updatedAt) : obj.updatedAt,
          abnormalDate : obj.abnormalDate ? new Date(obj.abnormalDate) : obj.abnormalDate,
        }
      );
      return obj;
    });
    return documentWithDates;
  } else if (collectionName === 'lectures') {
    const documentWithDates = documents.map((obj, index) => {
      Object.assign(obj, {
          _id : new ObjectId(obj._id),
          teacher : obj.teacher ? new ObjectId(obj.teacher) : obj.teacher,
          createdAt : obj.createdAt ? new Date(obj.createdAt) : obj.createdAt,
          updatedAt : obj.updatedAt ? new Date(obj.updatedAt) : obj.updatedAt,
          date : obj.date ? new Date(obj.date) : obj.date,
        }
      );
      return obj;
    });
    return documentWithDates;
  } else if (collectionName === 'projects') {
    const documentWithDates = documents.map((obj, index) => {
      Object.assign(obj, {
          _id : new ObjectId(obj._id),
          member : obj.member ? new ObjectId(obj.member) : obj.member,
          createdAt : obj.createdAt ? new Date(obj.createdAt) : obj.createdAt,
          updatedAt : obj.updatedAt ? new Date(obj.updatedAt) : obj.updatedAt,
          start_date : obj.start_date ? new Date(obj.start_date) : obj.start_date,
          end_date : obj.end_date ? new Date(obj.end_date) : obj.end_date,
        }
      );
      return obj;
    });
    return documentWithDates;
  } else if (collectionName === 'users') {
    const documentWithDates = documents.map((obj, index) => {
      Object.assign(obj, {
          _id : new ObjectId(obj._id),
          createdAt : obj.createdAt ? new Date(obj.createdAt) : obj.createdAt,
          updatedAt : obj.updatedAt ? new Date(obj.updatedAt) : obj.updatedAt,
          birthday : obj.birthday ? new Date(obj.birthday) : obj.birthday,
          start_date : obj.start_date ? new Date(obj.start_date) : obj.start_date,
          end_date : obj.end_date ? new Date(obj.end_date) : obj.end_date,
        }
      );
      return obj;
    });
    return documentWithDates;
  } else if (collectionName === 'vacations') {
    const documentWithDates = documents.map((obj, index) => {
      Object.assign(obj, {
          _id : new ObjectId(obj._id),
          member : obj.member ? new ObjectId(obj.member) : obj.member,
          createdAt : obj.createdAt ? new Date(obj.createdAt) : obj.createdAt,
          updatedAt : obj.updatedAt ? new Date(obj.updatedAt) : obj.updatedAt,
          start_date : obj.start_date ? new Date(obj.start_date) : obj.start_date,
          end_date : obj.end_date ? new Date(obj.end_date) : obj.end_date,
        }
      );
      return obj;
    });
    return documentWithDates;
  } 
  else if (collectionName === 'allowips') {
    const documentWithDates = documents.map((obj, index) => {
      Object.assign(obj, {
          _id : new ObjectId(obj._id),  
          createdAt : obj.createdAt ? new Date(obj.createdAt) : obj.createdAt,
          updatedAt : obj.updatedAt ? new Date(obj.updatedAt) : obj.updatedAt,
        }
      );
      return obj;
    });
    return documentWithDates;
  } 
  return documents;
}

async function restoreMongoDBFromEncryptedZip(uri, dbName, encryptedBackupPath, decryptedZipPath) {
  const client = new MongoClient(uri);

  try {
    // Decrypt the ZIP file

    await decryptFile(encryptedBackupPath, decryptedZipPath, ENCRYPTION_KEY, IV);
    console.log(`Decrypted backup to: ${decryptedZipPath}`);

    await client.connect();
    console.log('Connected to MongoDB for restore.');

    const db = client.db(dbName);

    const zipStream = fs.createReadStream(decryptedZipPath).pipe(unzipper.Parse({ forceStream: true }));

    for await (const entry of zipStream) {
      const fileName = entry.path;
      const collectionName = fileName.replace('.json', '');

      if (entry.type === 'File') {
        const jsonChunks = [];

        for await (const chunk of entry) {
          jsonChunks.push(chunk.toString());
        }

        let documents = JSON.parse(jsonChunks.join(''));
        const collection = db.collection(collectionName);
        
        documents = convertDocuments(collectionName, documents);

        await collection.deleteMany({}); // Clear existing data
        await collection.insertMany(documents);
        console.log(`Restored collection: ${collectionName}`);
      } else {
        entry.autodrain();
      }
    }

    console.log('Restore completed successfully.');

    // Clean up decrypted file
    fs.unlinkSync(decryptedZipPath);
  } catch (error) {
    console.error('Error during restore:', error);
  } finally {
    await client.close();
  }
}

module.exports = {backupMongoDBAsEncryptedZip, restoreMongoDBFromEncryptedZip};
