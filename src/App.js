import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";
import "./App.css";

export default function App() {
	const [currentAccount, setCurrentAccount] = useState(null);
	const [isSending, setIsSending] = useState(false);
	const [allWaves, setAllWaves] = useState([]);

	const contractABI = abi.abi;
	const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

	/*
	 * This function returns the first linked account found.
	 * If there is no account linked, it will return null.
	 */
	const checkIfWalletIsConnected = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				console.log("Make sure you have metamask!");
				return;
			} else {
				console.log("We have the ethereum object", ethereum);
			}

			const accounts = await ethereum.request({ method: "eth_accounts" });

			if (accounts.length !== 0) {
				const account = accounts[0];
				console.log("Found an authorized account:", account);
				setCurrentAccount(account);
				return account;
			} else {
				console.log("No authorized account found");
				return null;
			}
		} catch (error) {
			console.log(error);
			return null;
		}
	};

	const connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert("Get MetaMask!");
				return;
			}

			const accounts = await ethereum.request({ method: "eth_requestAccounts" });

			console.log("Connected", accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log(error);
		}
	};

	const wave = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

				let count = await wavePortalContract.getTotalWaves();
				console.log("Retrieved total wave count...", count.toNumber());

				/*
				 * Execute the actual wave from your smart contract
				 */
				const waveTxn = await wavePortalContract.wave("mock wave");
				console.log("Mining...", waveTxn.hash);
				setIsSending(true);

				await waveTxn.wait();
				console.log("Mined -- ", waveTxn.hash);
				setIsSending(false);

				count = await wavePortalContract.getTotalWaves();
				console.log("Retrieved total wave count...", count.toNumber());
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};

	const getAllWaves = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
				/*
				 * Execute the actual wave from your smart contract
				 */
				const allWaves = await wavePortalContract.getAllWaves();

				setAllWaves(
					allWaves.map((wave) => ({
						waver: wave.waver,
						message: wave.message,
						timestamp: new Date(wave.timestamp * 1000)
					}))
				);
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		checkIfWalletIsConnected();
	}, []);

	useEffect(() => {
		console.log(currentAccount);
		if (currentAccount) {
			getAllWaves();
		}
	}, [currentAccount]);

	return (
		<div className="mainContainer">
			<div className="dataContainer">
				<div className="header">👋 Hey there!</div>

				<div className="bio">
					I am farza and I worked on self-driving cars so that's pretty cool right? Connect your
					Ethereum wallet and wave at me!
				</div>

				<button className="waveButton" onClick={wave}>
					{isSending ? "Loading..." : "Wave at Me"}
				</button>

				{!currentAccount && (
					<button className="waveButton" onClick={connectWallet}>
						Connect Wallet
					</button>
				)}

				{!!allWaves.length && (
					<div className="all-waves">
						<h2 style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
							All Waves <button onClick={getAllWaves}>Reload</button>
						</h2>
						<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
							{allWaves.map((wave) => (
								<div key={wave.timestamp}>
									<div>Address: {wave.waver}</div>
									<div>Message: {wave.message}</div>
									<div>Time: {wave.timestamp.toString()}</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
