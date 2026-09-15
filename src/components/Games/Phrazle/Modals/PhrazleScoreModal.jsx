import React, { useState, useEffect,  useRef } from 'react';
import { Modal, Button, Form, FloatingLabel } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { DateTime, Duration } from 'luxon';
import { isPhrazleGraceActive } from '../../../../utils/gracePeriod';

const PhrazleScoreModal = ({ showForm, handleFormClose, onSubmit, score, setScore, loginUsername}) => {
  const [isPasted, setIsPasted] = useState(false);
  const [gameNumber, setPhrazleGameNumber] = useState();
  
  const calculatePhrazleGameNumber = () => {
     // First Phrasle game date (oct 18, 2025)
    const firstGameDate = new Date(2025, 10, 18); // local time, midnight
    firstGameDate.setHours(0, 0, 0, 0);

    const now = new Date();
   
    now.setHours(0, 0, 0, 0); // today at local midnight

    // Timezone offset correction
    const offsetDiffInMs = 60 * (now.getTimezoneOffset() - firstGameDate.getTimezoneOffset()) * 1000;

    // Milliseconds difference between today and firstGameDate, adjusted
    const timeDiff = now.getTime() - firstGameDate.getTime() - offsetDiffInMs;

    // Number of full days passed
    const daysPassed = Math.ceil(timeDiff / (24 * 60 * 60 * 1000));

    // Return game number: 2 games per day, based on AM/PM
    const currentHour = new Date().getHours();
    return 2 * daysPassed + (currentHour < 12 ? 1 : 2);
};

  
useEffect(() => {
  const updateGameNumber = () => {
      setPhrazleGameNumber(calculatePhrazleGameNumber());
  };

  updateGameNumber(); // initial run

  // Check every minute for the AM/PM reset. Mobile browsers routinely
  // pause this interval while the tab is backgrounded (e.g. while the
  // Gamler is off playing the actual game), so it can't be relied on
  // alone - a Gamler returning after a reset could still see the old
  // period's number and have their real, correct result rejected as
  // "not today's game."
  const interval = setInterval(() => {
      updateGameNumber();
  }, 60 * 1000); // every minute

  // Recompute immediately whenever the tab regains focus, so a paused
  // interval can't leave this stale.
  const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
          updateGameNumber();
      }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, []);
    
    const handlePaste = (event) => {
      const pastedData = event.clipboardData.getData('Text').trim();
      const phrazleTextExists = pastedData.includes('Phrazle');
      const todaysNumberExists = pastedData.includes(gameNumber.toString());
      // For up to 3 hours after this period's reset, also accept the
      // immediately preceding period's result - it still gets filed under
      // that period's date correctly (see PhrazlePlayService.jsx's
      // onSubmit), this just lets it in the door.
      const previousNumberExists = isPhrazleGraceActive() &&
          pastedData.includes((gameNumber - 1).toString());

      if (!phrazleTextExists) {
        toast.error('This is not a Phrazle game!', { position: 'top-center' });
      } else if (!todaysNumberExists && !previousNumberExists) {
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

export default PhrazleScoreModal;
