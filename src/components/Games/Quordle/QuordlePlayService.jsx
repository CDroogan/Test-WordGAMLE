import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoginModal from './Modals/LoginModal';
import QuordleModal from './Modals/QuordleScoreModal';

function QuordlePlayService({ updateStatsChart }) {
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

  const handleShow = (url) => {
    if (!loginUsername || !loginUserEmail) {
        setShowLoginPrompt(true);
        return;
    }
    window.open(url, '_blank');
    setShowForm(true);
};

const splitIntoRows = (inputString, rowLength) => {
  const rows = [];
  const charArray = Array.from(inputString);
  for (let i = 0; i < charArray.length; i += rowLength) {
    rows.push(charArray.slice(i, i + rowLength).join(""));
  }
  return rows;
};

const determineAttempts = (score) => {
    // Match 1️⃣-9️⃣ or 🟥
    const TOKEN_RE = /([1-9]\uFE0F?\u20E3)|(\u{1F7E5})/gu;
    const RED_SQUARE = '\u{1F7E5}';

    const tokens = [...score.matchAll(TOKEN_RE)].map(m => m[0]);

    console.log("Score:", score);
    console.log("Tokens:", tokens);

    if (tokens.length < 4) {
        return {
            isWin: false,
            solvedAt: {},
            sumSolvedAt: 0,
            winAttempt: null,
            attempts: null
        };
    }

    const boardResults = tokens.slice(0, 4);

    const solvedAt = {};

    boardResults.forEach((token, index) => {
        if (token === RED_SQUARE) {
            solvedAt[index + 1] = 10;
        } else {
            // Extract the digit from 1️⃣, 2️⃣, etc.
            const digit = token.match(/[1-9]/);
            solvedAt[index + 1] = digit ? Number(digit[0]) : 10;
        }
    });

    const sumSolvedAt = Object.values(solvedAt).reduce((a, b) => a + b, 0);

    const isWin = !boardResults.includes(RED_SQUARE);

    const attempts = isWin
        ? Math.max(...Object.values(solvedAt))
        : null;

    return {
        isWin,
        solvedAt,
        sumSolvedAt,
        winAttempt: attempts,
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
            <div className="my-3">
                <Button className="quordle-btn px-5" onClick={() => handleShow('https://www.merriam-webster.com/games/quordle/#/')}>
                    Play
                </Button>
            </div>

            <LoginModal showLoginPrompt={showLoginPrompt} handleLoginPromptClose={handleLoginPromptClose} />

            <QuordleModal
                showForm={showForm}
                handleFormClose={handleFormClose}
                onSubmit={onSubmit}
                score={score}
                setScore={setScore}
                loginUsername={loginUsername}
            />
        </>
    );
}

export default QuordlePlayService;