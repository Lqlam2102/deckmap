import ButtonMore from '~/components/Button/ButtonMore';
import styles from './Home.module.scss';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
const cx = classNames.bind(styles);

function Home() {
    return (
        <div className={cx('main')}>
            <h1>The Coolest Header Ever</h1>
            <p>This is literally one of the coolest headers.</p>
            <Link to="/deckmap" target="noopener">
                <ButtonMore />
            </Link>
        </div>
    );
}

export default Home;
