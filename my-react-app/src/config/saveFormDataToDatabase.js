// saveFormDataToDatabase.js

import { ref, push } from 'firebase/database';
import { db } from '../config/firebaseConfig';

const saveFormDataToDatabase = async (formData) => {
  // Get a reference to the "bandobastDetails" node in the database
  const bandobastRef = ref(db, 'bandobastDetails');

  try {
    // Push the form data to the database
    await push(bandobastRef, {
      title: formData.title,
      personnel: formData.personnel,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      timestamp: new Date().toISOString(),
    });

    console.log('Data saved successfully!');
  } catch (error) {
    throw new Error('Error saving data to database: ' + error.message);
  }
};

export default saveFormDataToDatabase;
