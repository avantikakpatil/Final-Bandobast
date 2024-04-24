// saveFormDataToDatabase.js

import { ref, push } from 'firebase/database';
import { db } from '../config/firebaseConfig';

const saveFormDataToDatabase = async (formData) => {
  // Get a reference to the "bandobastDetails" node in the database
  const bandobastRef = ref(db, 'bandobastDetails');

  try {
    // Ensure that personnel locations are valid before saving
    const personnelWithValidLocations = formData.personnel.map((personnel) => {
      if (personnel.location && personnel.location.latitude && personnel.location.longitude) {
        return {
          id: personnel.id,
          location: {
            latitude: personnel.location.latitude,
            longitude: personnel.location.longitude
          }
        };
      } else {
        // Handle missing or undefined locations
        console.error(`Personnel location is missing for personnel with ID ${personnel.id}`);
        return null; // Exclude personnel with missing location data
      }
    }).filter(personnel => personnel !== null); // Remove personnel with missing location data

    // Push the form data to the database, including coordinates
    await push(bandobastRef, {
      title: formData.title,
      personnel: personnelWithValidLocations,
      coordinates: formData.coordinates, // Include coordinates here
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
