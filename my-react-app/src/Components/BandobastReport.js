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
        setBandobastDetails(details);
      } else {
        setBandobastDetails([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching bandobast details:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const generatePDF = (detail) => {
    const doc = new jsPDF();
    doc.text('Bandobast Report', 10, 10);
    doc.text(`Bandobast Name: ${detail.title}`, 10, 20);
    doc.text(`Number of Personnel Assigned: ${detail.personnel?.length || 0}`, 10, 30);
    doc.text(`Number of Personnel Moved Out: ${detail.movedOut || 0}`, 10, 40);
    doc.text(`Additional Information: ${detail.additionalInfo || 'N/A'}`, 10, 50);
    doc.setFontSize(7);
    doc.text(`Date of Printing: ${new Date().toLocaleString()}`, 150, 290);
    doc.save(`${detail.title}_BandobastReport.pdf`);
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
                      <td>{detail.personnel?.length || 0}</td>
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
            <p><strong>Number of Personnel Assigned:</strong> {viewDetail.personnel?.length || 0}</p>
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
