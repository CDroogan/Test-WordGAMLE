import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, FloatingLabel } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { isDailyGraceActive } from '../../../../utils/gracePeriod';

const ConnectionsScoreModal = ({ showForm, handleFormClose, onSubmit, score, setScore, loginUsername }) => {
  
  const [isPasted, setIsPasted] = useState(false);
  const [gameNumber, setGameNumber] = useState(null);
  
  const calculateGameNumber = () => {
      // Start Date: June 19, 2021, 12:00 AM (Midnight Local Time)
      const firstGameDate = new Date(2023, 5, 11); // Ensures local midnight
  
      // Get current local time
      const now = new Date();
  
      // Convert both dates to local YYYY-MM-DD only (ignoring time)
      const firstDateOnly = new Date(firstGameDate.getFullYear(), firstGameDate.getMonth(), firstGameDate.getDate());
      const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
      // Calculate difference in full days
      const diffInDays = Math.floor((nowDateOnly - firstDateOnly) / (24 * 60 * 60 * 1000));
  
      // Game number starts at 1
      const currentGameNumber = diffInDays;

  
      return currentGameNumber;
  };
  
  useEffect(() => {
      setGameNumber(calculateGameNumber());

      // Check every minute and update exactly at 12:00 AM (Midnight). Mobile
      // browsers routinely pause this interval while the tab is backgrounded
      // (e.g. while the Gamler is off playing the actual game), so it can't
      // be relied on alone - a Gamler returning after midnight could still
      // see yesterday's game number and have their real, correct result
      // rejected as "not today's game."
      const interval = setInterval(() => {
          const now = new Date();
          if (now.getHours() === 0 && now.getMinutes() === 0) {
              setGameNumber(calculateGameNumber());
          }
      }, 60 * 1000); // Check every minute

      // Recompute immediately whenever the tab regains focus, so a paused
      // interval can't leave this stale.
      const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
              setGameNumber(calculateGameNumber());
          }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
          clearInterval(interval);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
  }, []);
  
  const handlePaste = (event) => {
      const pastedData = event.clipboardData.getData('Text');
      const connectionsTextExists = pastedData.includes('Connections');
      const todaysNumberExists = pastedData.includes(`Puzzle #${gameNumber}`);
      // For up to 3 hours after today's reset, also accept yesterday's
      // result - it still gets filed under yesterday's date correctly
      // (see ConnectionPlayService.jsx's onSubmit), this just lets it in.
      const previousNumberExists = isDailyGraceActive() &&
          pastedData.includes(`Puzzle #${gameNumber - 1}`);
      if (!connectionsTextExists) {
        toast.error('This is not a Connections game!', { position: 'top-center' });
      } else if (!todaysNumberExists && !previousNumberExists) {
        toast.error('This is not today\'s game result', { position: 'top-center' });
      } else {
        setIsPasted(true); // Mark that the data has been pasted
        setScore(pastedData); // Set the pasted value to the score
      }
  
      event.preventDefault(); // Prevent the default paste action
    };

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
export default ConnectionsScoreModal;
