import React, { useEffect, useState } from "react";
import Button from "../components/common/Button";
import { useNavigate } from "react-router-dom";
import Radio from "../components/common/Radio";
import Input from "../components/common/Input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useSelector, useDispatch } from "react-redux";
import { setPassword, setSeedType, setSeeds } from "../redux/appSlice";
import { RootState } from "../redux/store";
import axios from "axios";
import { SERVER_URL } from "../utils/constants";
import { useSocket } from "../context/SocketContext";

const Create: React.FC = () => {
    const socket = useSocket()
    const dispatch = useDispatch()
    const navigate = useNavigate();

    const { seedType, password } = useSelector((state: RootState) => state.app)

    const [step, setStep] = useState<'password' | 'seedType'>('password');
    const [passwordInputType, setPasswordInputType] = useState<string>('password');
    const [confirmPassword, setConfirmPassword] = useState<string>();
    const [passwordStatus, setPasswordStatus] = useState<boolean>(false);
    const [creatingStatus, setCreatingStatus] = useState<boolean>(false);

    const handleCreate = () => {
        setCreatingStatus(true);
        let passwordPrefix = '';
        if (seedType == '55chars') passwordPrefix = 'Q';
        axios.post(
            `${SERVER_URL}/api/ccall`,
            {
                command: `login ${passwordPrefix}${password}`,
                flag: `create`
            }
        ).then((resp: any) => {
            console.log(resp)
            if (resp.data.value.result == 0 && resp.data.value.seedpage == 1) {
                const seeds = resp.data.value.display.split(' ')
                if (seeds.length == 1) {
                    dispatch(setSeeds(seeds[0]))
                } else {
                    dispatch(setSeeds(seeds));
                }
                navigate(`/backup`)
            }
        }).catch((error) => {
            console.error(error)
        }).finally(() => {
            setCreatingStatus(false);
        })
    }

    const handlePassword = (value: string) => {
        dispatch(setPassword(value));
    }

    const handleConfirmPassword = (value: string) => {
        setConfirmPassword(value);
    }

    const handleSeedType = (value: string) => {
        dispatch(setSeedType(value));
    }

    const handleEye = () => {
        setPasswordInputType((prev) => {
            if (prev == 'text') return 'password'
            else return 'text'
        })
    }

    const handleBack = () => {
        navigate('/login')
    }

    useEffect(() => {
        if (password != "") {
            socket?.emit('passwordAvail', { command: `checkavail ${password}`, flag: 'passwordAvail' })
        } else {
            setPasswordStatus(true)
        }
    }, [password, confirmPassword])

    useEffect(() => {
        dispatch(setPassword(""))
        setConfirmPassword("")
    }, [])

    useEffect(() => {
        if (socket) {
            socket.on('test', (msg) => {
                console.log(msg)
            })
            socket.on('passwordAvail', (msg: boolean) => {
                setPasswordStatus(msg)
            })
        }
    }, [socket])

    return (
        <>
            <div className="bg-light w-full dark:bg-dark text-light dark:text-dark max-w-[500px] mx-auto p-[40px] rounded-[10px] shadow-[0_15px_25px_rgba(0,0,0,0.5)] text-center z-0">
                <img className="mx-auto" src="images/logo.png" width="100px" />
                <h2 className="my-[15px] mx-auto text-light dark:text-dark text-[2rem]">Create</h2>
                <div className="mb-[20px] leading-[25px] text-[1rem] font-normal">
                    {step == 'password' &&
                        "Secure your account with a new password."
                    }
                    {step == 'seedType' &&
                        "There are two ways to create your account."
                    }
                </div>
                <div className="relative">
                    {
                        step == 'password' &&
                        <>
                            <div className="relative">
                                <Input inputType={passwordInputType} onChange={handlePassword} placeHolder="Password" />
                                {
                                    !passwordStatus &&
                                    <p className="w-full text-left text-red-600">Password already exist.</p>
                                }
                                <FontAwesomeIcon onClick={handleEye} icon={(passwordInputType == 'password' ? faEye : faEyeSlash)} className="absolute top-[15px] right-3 text-gray-500 cursor-pointer" />
                                <Input inputType={passwordInputType} onChange={handleConfirmPassword} placeHolder="Confirm password" />
                                {
                                    password != confirmPassword &&
                                    <p className="w-full text-left text-red-600">Password does not match.</p>
                                }
                            </div>
                            <div className="flex gap-2">
                                <Button buttonValue="Back" onClick={handleBack} />
                                <Button buttonValue="Next" onClick={() => { setStep('seedType') }} disabled={!passwordStatus || (password != confirmPassword) || (password == "")} />
                            </div>
                        </>
                    }
                    {
                        step == 'seedType' &&
                        <>
                            <div className="flex justify-evenly mb-3">
                                <Radio
                                    label="24 Words"
                                    name="options"
                                    value="24words"
                                    checked={seedType === '24words'}
                                    onChange={handleSeedType}
                                />
                                <Radio
                                    label="55 Chars"
                                    name="options"
                                    value="55chars"
                                    checked={seedType === '55chars'}
                                    onChange={handleSeedType}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button buttonValue="Back" onClick={() => { setStep('password') }} />
                                <Button buttonValue="Create" onClick={handleCreate} disabled={creatingStatus} />
                            </div>
                        </>
                    }
                </div>
            </div>
        </>
    )
}

export default Create;