import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

// Lists all four games as a centered, vertically stacked list — no swiping
// needed. Uses the same navigate(`/${link}`) pattern as the game buttons on
// the Home page, so clicking a game here is exactly the same experience as
// clicking one from the home page.
const GamesPage = () => {
  const navigate = useNavigate();

  const handleNavigation = (link) => {
    navigate(`/${link}`);
  };

  return (
    <Container className="text-center py-4">
      <div className="games-page-list">
        <Button className="wordle-btn games-page-btn" onClick={() => handleNavigation('wordle')}>Wordle</Button>
        <Button className="connections-btn games-page-btn" onClick={() => handleNavigation('connections')}>Connections</Button>
        <Button className="phrazle-btn games-page-btn" onClick={() => handleNavigation('phrazle')}>Phrazle</Button>
        <Button className="quordle-btn games-page-btn" onClick={() => handleNavigation('quordle')}>Quordle</Button>
      </div>
    </Container>
  );
};

export default GamesPage;
