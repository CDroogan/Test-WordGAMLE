import { useState, useEffect } from 'react';
import Axios from 'axios';
import OctordleGuessDistribution from './OctordleGuessDistribution';

function OctordleStatistics({ statschart }) {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA?.email;
    const [totalGame, setTotalGame] = useState('');
    const [totalWin, setTotalWin] = useState('');
    const [OctordleStatsData, setOctordleStatsData] = useState();
    const [currentStreak, setcurrentStreak] = useState();
    const [maxStreak, setmaxStreak] = useState();
    const [guessDistribution, setguessDistribution] = useState();

    useEffect(() => {
        if (loginuserEmail) {
            getStatsValue();
        }
      }, [statschart])

    function getStatsValue() {
        Axios.get(`${baseURL}/games/octordle/get-statistics.php?useremail=${loginuserEmail}`)
            .then((response) => {
                const statistics = response.data.statistics;
                setOctordleStatsData(statistics);
                setTotalGame(statistics.totalGamesPlayed);
                setTotalWin(statistics.winPercentage);
                setcurrentStreak(statistics.currentStreak);
                setmaxStreak(statistics.maxStreak);
                setguessDistribution(statistics.guessDistribution);
            })
            .catch((error) => {
                console.error("Error fetching data: ", error);

            });
    }

    return (
            <div className="statistics">
                <h2 className='text-uppercase'>Statistics</h2>

                {OctordleStatsData ? (
                    <>
                        <ul>
                            <li>
                                <div className='value'>{totalGame}</div>
                                <div className='bottom-text'>Played</div>
                            </li>
                            <li>
                                <div className='value'>{totalWin}</div>
                                <div className='bottom-text'>Win %</div>
                            </li>
                            <li>
                                <div className='value'>{currentStreak}</div>
                                <div className='bottom-text'>Win Streak</div>
                            </li>
                            <li>
                                <div className='value'>{maxStreak}</div>
                                <div className='bottom-text'>Max Streak</div>
                            </li>
                        </ul>
                        <div className="guess-distribution my-4">
                            <OctordleGuessDistribution guessDistribution={guessDistribution} />
                        </div>

                    </>
                ) : (
                    <div>Data Not Found</div>
                )}
            </div>
        );
}

export default OctordleStatistics;
