import React, { useState, useEffect } from 'react';
import { Col, Container, Row, Button } from 'react-bootstrap';
import Octordlegamesection from './Octordlegamesection';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoginModal from './Modals/LoginModal';
import OctordleScoreModal from './Modals/OctordleScoreModal';

function GamesLayout() {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth')) || {};
  const { username: loginUsername, email: loginUserEmail } = USER_AUTH_DATA;
  const userId = USER_AUTH_DATA?.id;
  const [allGroup, setAllGroup] = useState([]);

  // Groups this user belongs to, so a submitted score can notify group
  // members ("X has played Octordle") and announce a winner once everyone
  // in the group has played - same as Wordle/Connections/Phrazle.
  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        const response = await Axios.get(`${baseURL}/groups/get-user-groups-data.php`, {
          params: { user_id: userId },
        });
        setAllGroup(response.data);
      } catch (error) {
        console.error("Error fetching user joined groups:", error);
      }
    };

    if (userId) fetchUserGroups();
  }, [userId]);

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

  const handleShow = async (event) => {
    event.preventDefault();
    if (!loginUsername || !loginUserEmail) {
      setShowLoginPrompt(true);
      return;
    }
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


    const groupGameMap = (allGroup || []).map(group => ({
      groupId: group.id,
      selectedGame: group.selected_games,
      groupName: group.group_name
    }));

    const scoreObject = {
      baseURL,
      username: loginUsername,
      useremail: loginUserEmail,
      octordlescore: score,
      isWin,
      gamleScore,
      createdAt: adjustedCreatedAt,
      currentUserTime: adjustedCreatedAt,
      lastgameisWin: isWin,
      timeZone,
      groups: groupGameMap,
      userId,
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
      <Container>
        <Row className="justify-content-center align-items-center">
          <Col className="text-center py-3">
            {USER_AUTH_DATA.username ? <h2>{"Welcome " + USER_AUTH_DATA.username + "!"}</h2> : <h2>{"Welcome Guest!"}</h2>}
          </Col>
        </Row>
        <Row className="justify-content-center align-items-center">
          <Octordlegamesection />
        </Row>
        <Row className="justify-content-center align-items-center">
          <Col sm={6} className="py-4 px-3">
            <div>
              <p>Click the “Play” button to go to the Octordle website and play. Then:</p>
              <ol>
                <li><strong>PLAY:</strong> Play Octordle</li>
                <li><strong>COPY:</strong> Click SHARE, then COPY to copy your Octordle result</li>
                <li><strong>PASTE:</strong> Navigate back to WordGAMLE.com to paste your Octordle result</li>
              </ol>
              <Row className="d-flex justify-content-between align-items-center">
                <Col sm={7} xs={6}>
                  <p className="bottom-message">*For anyone who has already played and has the result copied, click the “Enter Result” button to enter today’s game result.</p>
                </Col>
                <Col sm={5} xs={6} className="text-center text-sm-end">
                  <Button className="octordle-btn bottom-btn" onClick={handleShow}>
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

        <OctordleScoreModal
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
