const fs = require('fs');
const path = require('path');
// const dbproc = require('./utils/dbproc');

// const backupUri = 'mongodb://0.0.0.0:27017';
// const backupDbName = 'rbms124';
// const backupZipPath = './backup.zip';
// const encryptedBackupPath = './uploads/backup-encrypted.bin';

// const promise = dbproc.backupMongoDBAsEncryptedZip(backupUri, backupDbName, backupZipPath, encryptedBackupPath);

// promise.then(result => {
//     console.log("backup finished");
//     const decryptedZipPath = './backup-decrypted.zip';
//     const promise = dbproc.restoreMongoDBFromEncryptedZip(backupUri, backupDbName, encryptedBackupPath, decryptedZipPath);  
//     promise.then (() => {
//         console.log("restore finished");
//     })
// });

// function deleteFilesInDirectory(directoryPath) {
//     try {
//         // Read the files in the directory synchronously
//         const files = fs.readdirSync(directoryPath);

//         // Loop through all the files in the directory and delete them
//         for (const file of files) {
//         const filePath = path.join(directoryPath, file);
//         // Delete the file
//         fs.unlinkSync(filePath);
//         console.log(`Deleted: ${filePath}`);
//         }

//         console.log('All files deleted.');
//     } catch (err) {
//         console.error('Error deleting files:', err);
//     }
// }

// deleteFilesInDirectory("uploads");

// const ip = require('ip');

// function isIpInRange(ipAddress, fromIp, toIp) {
//   const ipNum = ip.toLong(ipAddress);  // Convert IP to a number
//   const fromNum = ip.toLong(fromIp);   // Convert "from" IP to a number
//   const toNum = ip.toLong(toIp);       // Convert "to" IP to a number

//   return ipNum >= fromNum && ipNum <= toNum;
// }
// console.log("check=", isIpInRange("192.168.140.11", "192.168.140.20", "192.168.140.170"));


const crypto = require('crypto');
// Generate a secure random 512-bit secret (64 bytes)
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('Generated JWT Secret:', jwtSecret);