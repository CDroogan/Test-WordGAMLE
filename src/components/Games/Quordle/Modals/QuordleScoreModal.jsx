import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, FloatingLabel } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { isDailyGraceActive, getQuordleGameNumber } from '../../../../utils/gracePeriod';

const QuordleScoreModal = ({ showForm, handleFormClose, onSubmit, score, setScore, loginUsername }) => {

  const [isPasted, setIsPasted] = useState(false);
  const [gameNumber, setGameNumber] = useState(null);

useEffect(() => {
    setGameNumber(getQuordleGameNumber());

    // Check every minute and update exactly at 12:00 AM (Midnight). Mobile
    // browsers routinely pause this interval while the tab is backgrounded
    // (e.g. while the Gamler is off playing the actual game), so it can't
    // be relied on alone - a Gamler returning after midnight could still
    // see yesterday's game number and have their real, correct result
    // rejected as "not today's game."
    const interval = setInterval(() => {
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0) {
            setGameNumber(getQuordleGameNumber());
        }
    }, 60 * 1000); // Check every minute

    // Recompute immediately whenever the tab regains focus, so a paused
    // interval can't leave this stale.
    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            setGameNumber(getQuordleGameNumber());
        }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
        clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
}, []);


  // Function to validate Wordle score
  // const validateScore = (data) => {
  //   const wordleExists = data.includes('Wordle'); // Check if 'Wordle' is present
  //   const numberExists = gameNumber.toLocaleString();
  //   return wordleExists && numberExists;
  // };

  // This function is triggered when a paste happens
  const handlePaste = (event) => {
    const pastedData = event.clipboardData.getData('Text');
    const quordleTextExists = pastedData.includes('Quordle');
    const todaysNumberExists = pastedData.includes(String(gameNumber));
    // For up to 3 hours after today's reset, also accept yesterday's
    // result - it still gets filed under yesterday's date correctly (see
    // QuordlePlayService.jsx's onSubmit), this just lets it in the door.
    const previousNumberExists = isDailyGraceActive() &&
        pastedData.includes(String(gameNumber - 1));

    if (!quordleTextExists) {
      toast.error('This is not a Quordle game score!', { position: 'top-center' });
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

export default QuordleScoreModal;
