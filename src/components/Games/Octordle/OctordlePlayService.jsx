import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoginModal from './Modals/LoginModal';
import OctordleModal from './Modals/OctordleScoreModal';

function OctordlePlayService({ updateStatsChart }) {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth')) || {};
  const { username: loginUsername, email: loginUserEmail } = USER_AUTH_DATA;

  const [showForm, setShowForm] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [score, setScore] = useState('');

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

  // Gamle score is the literal "Score: NN" Octordle prints in its share
  // text (sum of all 8 boards' completion numbers). A result is a win only
  // if it contains no red square - a red square means at least one board
  // went unsolved, regardless of the numeric score.
  const determineResult = (text) => {
    const scoreMatch = text.match(/Score:\s*(\d+)/);
    if (!scoreMatch) {
        return { isWin: false, gamleScore: null };
    }
    const gamleScore = Number(scoreMatch[1]);
    const isWin = !text.includes('\u{1F7E5}'); // 🟥
    return { isWin, gamleScore };
  };


  const onSubmit = async (event) => {
    event.preventDefault();

    if (typeof updateStatsChart === "function") {
      updateStatsChart();
    }
    setShowForm(false);

    const { isWin, gamleScore } = determineResult(score);

    if (gamleScore === null) {
      toast.error('Could not read a score from that result.', { position: 'top-center' });
      return;
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
      octordlescore: score,
      isWin,
      gamleScore,
      createdAt: adjustedCreatedAt,
      currentUserTime: adjustedCreatedAt,
      lastgameisWin: isWin,
      timeZone,
    };

    try {
      const res = await Axios.post(
        `${baseURL}/games/octordle/create-score.php`,
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
          guessDistribution: [],
          handleHighlight: null,
          updatedDate: adjustedCreatedAt,
        };

        await updateTotalGamesPlayed(TotalGameObject);
        setScore("");
        navigate("/octordlestats");
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
      const res = await Axios.post(`${baseURL}/games/octordle/update-statistics.php`, TotalGameObject);

    } catch (err) {
      toast.error('Failed to update total games played');
    }
  };
    return (
        <>
            <div className="my-3">
                <Button className="octordle-btn px-5" onClick={() => handleShow('https://www.merriam-webster.com/games/octordle/daily')}>
                    Play
                </Button>
            </div>

            <LoginModal showLoginPrompt={showLoginPrompt} handleLoginPromptClose={handleLoginPromptClose} />

            <OctordleModal
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

export default OctordlePlayService;
