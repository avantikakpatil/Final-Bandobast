import React, { useState, useEffect } from 'react';
import Header from './Header';
import Navbar from './Navbar';
import './BandobastReport.css';
import { db } from '../config/firebaseConfig';
import { ref, onValue } from 'firebase/database';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const BandobastReport = () => {
  const [bandobastDetails, setBandobastDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDetail, setViewDetail] = useState(null);

  useEffect(() => {
    const bandobastRef = ref(db, 'bandobastDetails');
    const unsubscribe = onValue(bandobastRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const details = Object.entries(data).map(([id, value]) => ({ id, ...value }));
        fetchPersonnelNames(details);
      } else {
        setBandobastDetails([]);
        setLoading(false);
      }
    }, (error) => {
      console.error('Error fetching bandobast details:', error);
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);
  
  const fetchPersonnelNames = (details) => {
    const personnelRef = ref(db, 'personnel');
    onValue(personnelRef, (snapshot) => {
      const personnelData = snapshot.val();
      if (personnelData) {
        const updatedDetails = details.map((detail) => {
          const personnelIds = Object.keys(detail.personnel || {});
          const personnelNames = personnelIds.map((personnelId) => personnelData[personnelId]?.name || 'N/A');
          const personnelArray = personnelIds.map((personnelId) => ({
            ...personnelData[personnelId],
            id: personnelId
          }));
          return { ...detail, personnelNames, personnelArray };
        });
        setBandobastDetails(updatedDetails);
      }
      setLoading(false);
    });
  };

  const generatePDF = (detail) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Bandobast Report', 105, 10, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Bandobast Name: ${detail.title}`, 10, 30);

    // Geotag Location
    const locationText = `Location of Sector: Latitude ${detail.latitude}, Longitude ${detail.longitude}`;
    doc.text(locationText, 10, 50);

    // Number of Personnel Assigned
    doc.text(`Number of Personnel Assigned: ${detail.personnel ? Object.keys(detail.personnel).length : 0}`, 10, 70);

    // List of Personnel names that are assigned
    let personnelListText = 'List of Personnel Assigned:\n';
    if (detail.personnel) {
      detail.personnelArray.forEach((personnel, index) => {
        personnelListText += `${index + 1}. ${personnel.name || 'N/A'} (${personnel.position || 'N/A'})\n`;
      });
    } else {
      personnelListText += 'N/A';
    }
    doc.text(personnelListText, 10, 90);

    // Number of personnel outside and inside show in pie chart
    const personnelInside = detail.personnelArray.filter(personnel => !personnel.outside).length;
    const personnelOutside = detail.personnelArray.filter(personnel => personnel.outside).length;
    doc.addImage(getPieChart(personnelInside, personnelOutside), 'PNG', 120, 110, 80, 80);

    // Date of Printing
    doc.setFontSize(7);
    doc.text(`Date of Printing: ${new Date().toLocaleString()}`, 150, 290);

    doc.save(`${detail.title}_BandobastReport.pdf`);
  };

  // Helper function to generate pie chart image (dummy implementation)
  const getPieChart = (inside, outside) => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.arc(50, 50, 50, 0, inside / (inside + outside) * 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.arc(50, 50, 50, inside / (inside + outside) * 2 * Math.PI, 2 * Math.PI);
    ctx.fill();
    return canvas.toDataURL('image/png');
  };

  const viewReport = (detail) => {
    setViewDetail(detail);
  };

  const closeReport = () => {
    setViewDetail(null);
  };

  return (
    <div>
      <Header /> {/* Render the Header component */}
      <div className="dashboard">
        <Navbar /> {/* Render the Navbar component */}
        <div className="content">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Sr. No</th>
                    <th>Bandobast Name</th>
                    <th>Personnel Assigned</th>
                    <th>Personnel Moved Out</th>
                    <th>Additional Information</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bandobastDetails.map((detail, index) => (
                    <tr key={detail.id}>
                      <td>{index + 1}</td>
                      <td>{detail.title}</td>
                      <td>{detail.personnelNames.join(', ')}</td>
                      <td>{detail.movedOut || 0}</td>
                      <td>{detail.additionalInfo || 'N/A'}</td>
                      <td>
                        <button className="download-button" onClick={() => generatePDF(detail)}>Download as PDF</button>
                        <button className="view-button" onClick={() => viewReport(detail)}>View Report</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
      {viewDetail && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={closeReport}>&times;</span>
            <h2>Bandobast Report</h2>
            <p><strong>Bandobast Name:</strong> {viewDetail.title}</p>
            <p><strong>Location of Sector:</strong> Latitude {viewDetail.latitude}, Longitude {viewDetail.longitude}</p>
            <p><strong>Number of Personnel Assigned:</strong> {viewDetail.personnel ? Object.keys(viewDetail.personnel).length : 0}</p>
            <p><strong>List of Personnel Assigned:</strong></p>
            <ul>
              {viewDetail.personnel ? (
                viewDetail.personnelArray.map((personnel, index) => (
                  <li key={index}>{personnel.name || 'N/A'} ({personnel.position || 'N/A'})</li>
                ))
              ) : (
                <li>N/A</li>
              )}
            </ul>
            <p><strong>Number of Personnel Moved Out:</strong> {viewDetail.movedOut || 0}</p>
            <p><strong>Additional Information:</strong> {viewDetail.additionalInfo || 'N/A'}</p>
            <p className="print-date"><strong>Date of Printing:</strong> {new Date().toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BandobastReport;
