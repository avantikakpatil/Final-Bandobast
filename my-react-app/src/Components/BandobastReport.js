import React, { useState, useEffect } from 'react';
import Header from './Header';
import Navbar from './Navbar';
import './BandobastReport.css';
import { db } from '../config/firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const BandobastReport = () => {
  const [bandobastDetails, setBandobastDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDetail, setSelectedDetail] = useState(null);

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
    doc.text(`Bandobast Report: ${detail.title}`, 10, 10);
    doc.text(`Number of Personnel Assigned: ${detail.personnel?.length || 0}`, 10, 20);
    doc.text(`Number of Personnel Moved Out: ${detail.movedOut || 0}`, 10, 30);
    doc.text(`Additional Information: ${detail.additionalInfo || 'N/A'}`, 10, 40);
    doc.save(`${detail.title}_BandobastReport.pdf`);
  };

  const handleViewClick = (detail) => {
    setSelectedDetail(detail);
  };

  const handleCloseModal = () => {
    setSelectedDetail(null);
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
                        <button
                          className="download-button"
                          onClick={() => generatePDF(detail)}
                        >
                          Download PDF
                        </button>
                        <button
                          className="view-button"
                          onClick={() => handleViewClick(detail)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {selectedDetail && (
                <div className="modal">
                  <div className="modal-content">
                    <span className="close-button" onClick={handleCloseModal}>&times;</span>
                    <h2>Bandobast Report: {selectedDetail.title}</h2>
                    <p><strong>Number of Personnel Assigned:</strong> {selectedDetail.personnel?.length || 0}</p>
                    <p><strong>Number of Personnel Moved Out:</strong> {selectedDetail.movedOut || 0}</p>
                    <p><strong>Additional Information:</strong> {selectedDetail.additionalInfo || 'N/A'}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BandobastReport;
