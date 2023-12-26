import { ButtonMore } from '~/components/Button/ButtonMore';
import styles from './Home.module.scss';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Header from '~/Layout/Header';
const cx = classNames.bind(styles);

function Home() {
    const buttonMore = useRef(null);

    const [showButtonMore, setShowButtonMore] = useState(true);
    const handleScroll = () => {
        if (buttonMore.current.getBoundingClientRect().top <= 80) {
            setShowButtonMore(false);
        } else {
            setShowButtonMore(true);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    return (
        <div className={cx('body-home')}>
            <Header />
            <div className="container">
                <div className="content">
                    <div className={cx('main')}>
                        <h1>Khóa luận tốt nghiệp</h1>
                        <p>
                            Nghiên cứu mô hình học sâu, ứng dụng phân tích ảnh vệ tinh xác định lớp phủ rừng theo thời
                            gian và trực quan hóa trên bản đồ.
                        </p>

                        <Link
                            id="btn-more"
                            to="/deckmap"
                            target="noopener"
                            ref={buttonMore}
                            style={{ opacity: showButtonMore ? 1 : 0 }}
                        >
                            <ButtonMore />
                        </Link>
                        <div className={cx('intro')}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
