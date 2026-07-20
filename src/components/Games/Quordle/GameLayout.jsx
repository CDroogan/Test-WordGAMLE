import React, { useState, useEffect } from 'react';
import { Col, Container, Row, Button } from 'react-bootstrap';
import Quordlegamesection from './Quordlegamesection';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoginModal from './Modals/LoginModal';
import QuordleScoreModal from './Modals/QuordleScoreModal';

function GamesLayout() {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth')) || {};
  const { username: loginUsername, email: loginUserEmail } = USER_AUTH_DATA;
  
  const [showForm, setShowForm] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [score, setScore] = useState('');
  const [guessDistribution, setGuessDistribution] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [gameIsWin, setGameIsWin] = useState(false);
  
  const [totalGamesPlayed, setTotalGamesPlayed] = useState(0);
  const [totalWinGames, setTotalWinGames] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  
  const navigate = useNavigate();
  
  const handleFormClose = () => {
    setShowForm(false);
    setScore('');
  };

  const handleLoginPromptClose = () => {
    setShowLoginPrompt(false);
  };

  const handleShow = async (event) => {
    event.preventDefault();
    if (!loginUsername || !loginUserEmail) {
      setShowLoginPrompt(true);
      return;
    }
    setShowForm(true);
  };

  const splitIntoRows = (inputString, rowLength) => {
    const rows = [];
    const charArray = Array.from(inputString);
    for (let i = 0; i < charArray.length; i += rowLength) {
        rows.push(charArray.slice(i, i + rowLength).join(''));
    }
    return rows;
  };

const determineAttempts = (score) => {
    // Real Quordle share text is a 2x2 grid of per-board results, e.g.
    //   4️⃣1️⃣
    //   2️⃣3️⃣
    // where each token is either a keycap digit (guesses used to solve that
    // board) or 🟥 for a board that wasn't solved within 9 tries.
    const TOKEN_RE = /[0-9]️?⃣|\u{1F7E5}/gu;
    const RED_SQUARE = '\u{1F7E5}';
    const tokens = score.match(TOKEN_RE) || [];
    const boardResults = tokens.slice(0, 4);

    const solvedAt = {};
    boardResults.forEach((token, idx) => {
      if (token !== RED_SQUARE) {
        solvedAt[idx + 1] = parseInt(token, 10);
      }
    });

    // 6. Stats
    const solvedWords = Object.keys(solvedAt).length;
    const isWin = boardResults.length === 4 && solvedWords === 4;
    const attempts = isWin ? Math.max(...Object.values(solvedAt)) : null;
    const winAttempt = attempts;

    // 7. Sum solvedAt values
    const sumSolvedAt = Object.values(solvedAt).reduce((a, b) => a + b, 0);

    return {
      isWin,
      solvedAt,
      sumSolvedAt,
      winAttempt,
      attempts
    };
};


  
  
  const onSubmit = async (event) => {
    event.preventDefault();
    
    if (typeof updateStatsChart === "function") {
      updateStatsChart();
    }
    setShowForm(false);
    
    const { isWin, attempts, sumSolvedAt } = determineAttempts(score);

    let updatedDistribution = [...guessDistribution];
    if (isWin && attempts !== null && attempts <= updatedDistribution.length) {
      updatedDistribution[attempts - 1] += 1; // update the correct bucket
      setGuessDistribution(updatedDistribution);
    }
  
    // Get time zone offset in minutes
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const localDate = new Date();
    const offsetMinutes = localDate.getTimezoneOffset();  // Offset in minutes (positive for behind UTC, negative for ahead)
  
    // Now adjust the time by adding the time zone offset (this does not affect UTC, it gives the correct local time)
    const adjustedDate = new Date(localDate.getTime() - offsetMinutes * 60 * 1000); // Adjust time by the offset in milliseconds
  
    // Get the adjusted time in 24-hour format, e.g., "2024-12-02T15:10:29.476"
    const adjustedCreatedAt = adjustedDate.toISOString().slice(0, -1);  // "2024-12-02T15:10:29.476" (24-hour format)
  
  
    const scoreObject = {
      username: loginUsername,
      useremail: loginUserEmail,
      quordlescore: score,
      isWin,
      gamleScore: sumSolvedAt,
      createdAt: adjustedCreatedAt,
      currentUserTime: adjustedCreatedAt,
      lastgameisWin: isWin,
      guessDistribution: updatedDistribution,
      handleHighlight: attempts,
      timeZone,
    };
    
    try {
      const res = await Axios.post(
        `${baseURL}/games/quordle/create-score.php`,
        scoreObject
      );
  
      if (res.data.status === "success") {
        if (typeof updateStatsChart === "function") {
          updateStatsChart();
        }
  
        const newTotalGamesPlayed = (res.data.totalGamesPlayed || 0) + 1;
        const newTotalWinGames = isWin
          ? (res.data.totalWinGames || 0) + 1
          : res.data.totalWinGames || 0;
  
        setTotalGamesPlayed(newTotalGamesPlayed);
        setTotalWinGames(newTotalWinGames);
  
        const newCurrentStreak = isWin ? currentStreak + 1 : 0;
        const newMaxStreak = Math.max(currentStreak + (isWin ? 1 : 0), maxStreak);
  
        setCurrentStreak(newCurrentStreak);
        setMaxStreak(newMaxStreak);
  
        const TotalGameObject = {
          username: loginUsername,
          useremail: loginUserEmail,
          totalWinGames: newTotalWinGames,
          totalGamesPlayed: newTotalGamesPlayed,
          lastgameisWin: isWin,
          currentStreak: newCurrentStreak,
          maxStreak: newMaxStreak,
          guessDistribution: updatedDistribution,
          handleHighlight: attempts,
          updatedDate: adjustedCreatedAt,
        };
  
        await updateTotalGamesPlayed(TotalGameObject);
        setScore("");
        navigate("/quordlestats");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "An unexpected error occurred.",
        { position: "top-center" }
      );
    }
  };
  
    
  const updateTotalGamesPlayed = async (TotalGameObject) => {
    
    try {
      const res = await Axios.post(`${baseURL}/games/quordle/update-statistics.php`, TotalGameObject);
      
    } catch (err) {
      toast.error('Failed to update total games played');
    }
  };

  return (
    <>
      <Container>
        <Row className="justify-content-center align-items-center">
          <Col className="text-center py-3">
            {USER_AUTH_DATA.username ? <h2>{"Welcome " + USER_AUTH_DATA.username + "!"}</h2> : <h2>{"Welcome Guest!"}</h2>}
          </Col>
        </Row>
        <Row className="justify-content-center align-items-center">
          <Quordlegamesection />
        </Row>
        <Row className="justify-content-center align-items-center">
          <Col md={6} className="py-5">
            <div>
              <p>Click the “Play” button to go to the Quordle website and play. Then:</p>
              <ol>
                <li><strong>PLAY:</strong> Play Quordle</li>
                <li><strong>COPY:</strong> Click SHARE, then COPY to copy your Quordle result</li>
                <li><strong>PASTE:</strong> Navigate back to WordGAMLE.com to paste your Quordle result</li>
              </ol>
              <Row className="d-flex justify-content-between align-items-center">
                <Col md={8} xs={8}>
                  <p className="bottom-message">*For anyone who has already played and has the result copied, click the “Enter Result” button to enter today’s game result.</p>
                </Col>
                <Col md={4} xs={4}>
                  <Button className="Quordle-btn bottom-btn" onClick={handleShow}>
                    Enter Result
                  </Button>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

        <LoginModal
          showLoginPrompt={showLoginPrompt}
          handleLoginPromptClose={handleLoginPromptClose}
        />

        <QuordleScoreModal
          showForm={showForm}
          handleFormClose={handleFormClose}
          onSubmit={onSubmit}
          score={score}
          setScore={setScore}
          loginUsername={loginUsername}
        />
      </Container>
    </>
  );
}

export default GamesLayout;
