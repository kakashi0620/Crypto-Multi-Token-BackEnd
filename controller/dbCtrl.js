const MongooseModel = require("../models/lectureModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const dbproc = require("../utils/dbproc");
const fs = require('fs');
const path = require('path');

const STATUS_IDLE = 0;
const STATUS_STARTED = 1;
const STATUS_SUCCESS = 2;
const STATUS_FAILED = 3;
const STATUS_STOPPED = 4;

let cur_status = 0; // 0 : IDLE, 1 : STARTED, 2 : SUCCESS, 3 : FAILED, 4 : STOPPED

const getCurDateString = () => {
  const currentDate = new Date();

  // Get the current year, month, and day
  const year = currentDate.getFullYear().toString(); // Get last 2 digits of the year
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based, so add 1 and pad with 0 if needed
  const day = currentDate.getDate().toString().padStart(2, '0'); // Pad day with 0 if needed

  // Format as yy-mm-dd
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

function deleteFilesInDirectory(directoryPath) {
    try {
        // Read the files in the directory synchronously
        const files = fs.readdirSync(directoryPath);

        // Loop through all the files in the directory and delete them
        for (const file of files) {
        const filePath = path.join(directoryPath, file);
        // Delete the file
        fs.unlinkSync(filePath);
        console.log(`Deleted: ${filePath}`);
        }

        console.log('All files deleted.');
    } catch (err) {
        console.error('Error deleting files:', err);
    }
}

const backup = asyncHandler(async (req, res) => {
  try {
    deleteFilesInDirectory("uploads");
    const zipfileame = "rmbs124-db-" + getCurDateString() + ".zip";
    const binfilename = "rmbs124-db-" + getCurDateString() + ".bin";
    cur_status = STATUS_STARTED;

    const promise = dbproc.backupMongoDBAsEncryptedZip(process.env.MONGODB_URL, process.env.DBNAME, zipfileame, "./uploads/" + binfilename);
    promise.then(() => {
        cur_status = STATUS_SUCCESS;
    }).catch(() => {
        cur_status = STATUS_FAILED;
    });

    res.json({
      success : true,
      filename : binfilename
    });

  } catch (error) {
    throw new Error(error);
  }
});

function restore(filename) 
{
  const promise = dbproc.restoreMongoDBFromEncryptedZip(process.env.MONGODB_URL, process.env.DBNAME, "./uploads/" + filename, "./uploads/decrypted.zip");
  promise.then(() => {
      cur_status = STATUS_SUCCESS;
      deleteFilesInDirectory("uploads");
  }).catch(() => {
      cur_status = STATUS_FAILED;
      deleteFilesInDirectory("uploads");
  });
}

const status = asyncHandler(async (req, res) => {
    try {
      res.json({
        success : true,
        status : cur_status
      });
    } catch (error) {
      throw new Error(error);
    }
});

module.exports = {
  backup, restore, status
};
