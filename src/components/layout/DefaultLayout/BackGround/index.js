import './Background.scss';

function BackGround({ children }) {
    return (
        <>
            <div id="background">
                {children}
                <div id="stars-light">
                    <div id="stars"></div>
                    <div id="stars2"></div>
                    <div id="stars3"></div>
                </div>
            </div>
        </>
    );
}

export default BackGround;
