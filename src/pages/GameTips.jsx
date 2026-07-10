import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

function GameTips() {
  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <h2 className="mb-4">Game Tips</h2>
          <ul>
            <li>Play daily to keep your streak alive and climb the leaderboard.</li>
            <li>Join or create a group to compare scores with friends.</li>
            <li>Check the FAQ page if you get stuck on the rules of a game.</li>
            <li>Use the Invite Friends button to bring more players into your group.</li>
          </ul>
        </Col>
      </Row>
    </Container>
  );
}

export default GameTips;
