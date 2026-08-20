import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, FloatingLabel } from 'react-bootstrap';
import { toast } from 'react-toastify';

const OctordleScoreModal = ({ showForm, handleFormClose, onSubmit, score, setScore, loginUsername }) => {

  const [isPasted, setIsPasted] = useState(false);
  const [gameNumber, setGameNumber] = useState(null);

  const calculateGameNumber = () => {
  // Start Date: January 25, 2022 (Local Midnight) — Octordle Day 1
  const firstGameDate = new Date(2022, 0, 25); // Ensures local midnight

  // Get current local time
  const now = new Date();

  // Read each date's LOCAL calendar day (so "today" is the user's local
  // today, resetting at local midnight), then diff those calendar days via
  // Date.UTC so the subtraction is an exact 24h multiple regardless of DST.
  const firstDateOnly = Date.UTC(firstGameDate.getFullYear(), firstGameDate.getMonth(), firstGameDate.getDate());
  const nowDateOnly = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  // Difference in days
  const diffInDays = Math.floor((nowDateOnly - firstDateOnly) / (24 * 60 * 60 * 1000));

  return diffInDays; // Game # starts at 1
};

useEffect(() => {
    setGameNumber(calculateGameNumber());

    // Check every minute and update exactly at 12:00 AM (Midnight)
    const interval = setInterval(() => {
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0) {
            setGameNumber(calculateGameNumber());
        }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
}, []);

  // This function is triggered when a paste happens
  const handlePaste = (event) => {
    const pastedData = event.clipboardData.getData('Text');
    const octordleTextExists = pastedData.includes('Daily Octordle');
    const gamenumberExists = pastedData.includes(String(gameNumber));

    if (!octordleTextExists) {
      toast.error('This is not an Octordle game score!', { position: 'top-center' });
    } else if (!gamenumberExists) {
      toast.error('This is not today\'s game result', { position: 'top-center' });
    } else {
      setIsPasted(true);
      setScore(pastedData);
    }

    event.preventDefault();
  };


  // Prevent changes to the pasted data
  const handleChange = (event) => {
    if (isPasted) {
      event.preventDefault(); // If data is already pasted, prevent any changes
    } else {
      setScore(event.target.value); // Allow normal changes until paste
    }
  };

  return (
    <Modal show={showForm} onHide={handleFormClose}>
      <Modal.Header closeButton>
        <p>Game No: {gameNumber}</p>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3" controlId="formBasicName">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" placeholder="Enter Name" value={loginUsername} readOnly />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicScore">
            <Form.Label>Paste Result</Form.Label>
            <FloatingLabel controlId="floatingTextarea2" label="">
              <Form.Control
                as="textarea"
                value={score}
                onChange={handleChange} // Handle change to prevent editing
                onPaste={handlePaste} // Handle paste
                style={{ height: '100px' }}
              />
            </FloatingLabel>
          </Form.Group>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleFormClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OctordleScoreModal;
