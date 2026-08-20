import React from 'react';
import { Row, Col, Button} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import OctordlePlayService from './OctordlePlayService';

const Octordlegame = () => {
    const navigate = useNavigate();

    const handleOctordlestate = async (event) => {
        event.preventDefault();
        navigate('/octordlestats');
    };

    return (
        <>
            <Row>
                <Col className="text-sm-end">
                    <OctordlePlayService/>
                </Col>
                <Col className="text-sm-end">
                    <div className="my-3">
                        <Button className="octordle-btn px-5" onClick={handleOctordlestate}>
                            Stats
                        </Button>
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default Octordlegame;
