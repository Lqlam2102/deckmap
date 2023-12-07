import Header from '../Header';
import classNames from 'classnames/bind';
import styles from './LayoutOnlyHeader.module.scss';
const cx = classNames.bind(styles);
function LayoutOnlyHeader({ children }) {
    return (
        <div className={cx('body-home')}>
            <Header />
            <div className="container">
                <div className="content">{children}</div>
            </div>
        </div>
    );
}

export default LayoutOnlyHeader;
