import styled from "styled-components";

export default function Loader({ message }: { message?: string }) {
    return (
        <Container>
            <p>{message}</p>
        </Container>
    )
}

const Container = styled.div/*css */`
position: fixed;
top: 0;
left: 0;
height: 100%;
width: 100%;
background-color: #5555;
z-index: 10000; 
display: flex;
align-items: center;
justify-content: center;
`