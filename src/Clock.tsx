import React, { useEffect, useState } from 'react';
import axios from "axios";

interface IClockProps {
    url: string,
    title: string
}

export enum ControlEnum {
    START_ARROW_ANGLE = -90,
    SEC_MINUTE_LIMIT = 60,
    HOUR_LIMIT = 24,
    SEC_MINUTE_MOVE_ANGlE = 6,
    HOUR_MOVE_ANGLE = 30,
    SMOOTH_ANGLE = 5
}

function Clock({url, title}: IClockProps ) {
    const [error, setError] = useState('')

    const [seconds, setSeconds] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [hours, setHours] = useState(0);
    const [sDeg, setSDeg] = useState(ControlEnum.START_ARROW_ANGLE);
    const [mDeg, setMDeg] = useState(ControlEnum.START_ARROW_ANGLE);
    const [hDeg, setHDeg] = useState(ControlEnum.START_ARROW_ANGLE);

    let clock: any = null

    function generateExactTime (aDelay: number, aSeconds: number, aMilliseconds: number, aMinute: number, aHour: number): void {
        const floorSeconds: number = aSeconds * 1000 + aMilliseconds + aDelay;

            const floor = Math.ceil(floorSeconds / 1000) * 1000;
            const diff = floor - floorSeconds;

            setTimeout(() => {
                const currentSeconds = ((floorSeconds + diff )/ 1000);
                setSeconds(currentSeconds);

                if (currentSeconds === ControlEnum.SEC_MINUTE_LIMIT) {
                    aMinute++;
                    setSeconds(0);
                }

                setMinutes(aMinute === ControlEnum.SEC_MINUTE_LIMIT ? 0 : aMinute);

                const currentHours = aMinute === ControlEnum.SEC_MINUTE_LIMIT ? hours + 1 : aHour;
                setHours(currentHours === ControlEnum.HOUR_LIMIT ? 0 : currentHours);

                setSDeg(prev => prev + (currentSeconds) * ControlEnum.SEC_MINUTE_MOVE_ANGlE);
                setMDeg(prev => prev + aMinute * ControlEnum.SEC_MINUTE_MOVE_ANGlE);

                let correctAngle = Math.floor(aMinute / 10);
                setHDeg(prev => prev + (aHour * ControlEnum.HOUR_MOVE_ANGLE) + (correctAngle * ControlEnum.SMOOTH_ANGLE) - ControlEnum.SMOOTH_ANGLE);

                startClock(currentSeconds, aMinute, aHour);
            }, diff)
    }

    function getTime(): void {
        let delay: number = 0;
        const delayInterval = setInterval(() => delay++, 1);

        axios
            .get(`/api/Time/current/zone?timeZone=${url}`)
            .then(response => {

                const {seconds, milliSeconds, minute, hour} = response.data;

                generateExactTime(delay, seconds, milliSeconds, minute, hour);
                clearInterval(delayInterval);
            })
            .catch(error => setError(error.message))

        // Перечитал условие и переписал на промис
        // try {
        //     const response = await axios.get(`/api/Time/current/zone?timeZone=${url}`);
        //     const {seconds, milliSeconds, minute, hour} = response.data;
        //
        //     generateExactTime(delay, seconds, milliSeconds, minute, hour);
        //     clearInterval(delayInterval);
        // } catch (e: any) {
        //     setError(e.message);
        // }
    }

    function smoothMovement(): void {
        if ((mDeg - ControlEnum.START_ARROW_ANGLE) % ControlEnum.SEC_MINUTE_LIMIT === 0) {
            setHDeg(prev => prev + ControlEnum.SMOOTH_ANGLE);
        }
    }

    const styleS: any = {transform: `rotate(${sDeg}deg)`, transformOrigin: 'center left'};
    const styleM: any = {transform: `rotate(${mDeg}deg)`, transformOrigin: 'center left'};
    const styleH: any = {transform: `rotate(${hDeg}deg)`, transformOrigin: 'center left'};

    function startClock(aSec: number, aMin: number, aHour: number): void {
        clock = setInterval(() => {
            aSec++

            if (aSec === ControlEnum.SEC_MINUTE_LIMIT) {
                aSec = 0;
                setSDeg(prev => prev + ControlEnum.SEC_MINUTE_MOVE_ANGlE);
                setSeconds(0);
                setMDeg(prev => prev + ControlEnum.SEC_MINUTE_MOVE_ANGlE);
                aMin++;

                let currentMinutes = aMin;
                setHours(aHour === ControlEnum.HOUR_LIMIT ? 0 : aHour);

                if (currentMinutes === ControlEnum.SEC_MINUTE_LIMIT) {
                    aMin = 0;
                    currentMinutes = 0;
                    aHour++;

                    if (aHour === ControlEnum.HOUR_LIMIT) {
                        aHour = 0;
                    }
                    setHours(aHour);
                }

                setMinutes(prev => currentMinutes);
            }
            else {
                setSDeg(prev => prev + ControlEnum.SEC_MINUTE_MOVE_ANGlE);
                setSeconds(prev => prev + 1);
            }
        }, 1000 )
    }

    useEffect(() => {
        getTime();

        return clearInterval(clock);
    }, [])

    useEffect(() => {
        smoothMovement()
    }, [mDeg])

    return (
        <>
            <div className='clock__wrapper'>
                    <div className='clock__container'>
                        <span className='clock__view_top'>12</span>
                        <span className='clock__view_left'>9</span>
                        <span className='clock__view_bottom'>6</span>
                        <span className='clock__view_right'>3</span>
                        <div className='clock__s-arrow' style={styleS}></div>
                        <div className='clock__m-arrow' style={styleM}></div>
                        <div className='clock__h-arrow' style={styleH}></div>
                        {error ?
                            <h1 className='clock__title'>Ошибка</h1>
                            :
                            <h1 className='clock__title'>{title}</h1>
                        }
                        {hours}: {minutes}: {seconds}
                    </div>
            </div>
        </>
    );
}

export default Clock;
