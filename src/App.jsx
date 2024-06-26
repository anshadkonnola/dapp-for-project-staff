import React, { useState } from "react";
import MyGroup from "./components/MyGroup.jsx";
import walletConnectFcn from "./components/hedera/walletConnect.js";
import AdminPage from "./components/admin/AdminPage.jsx";
import "./styles/App.css";
import MyLog from "./components/MyLog.jsx";
import { userLogin } from "./components/hedera/contractUtils.js";
import StaffPage from "./components/staff/StaffPage.jsx";
import FacultyPage from "./components/faculty/FacultyPage.jsx";
import { contractId } from "./contracts/contractId.js";
import { UserPage, UserType } from "./utils.js";
// require("dotenv").config();

function App() {
	const [walletData, setWalletData] = useState();
	const [accountId, setAccountId] = useState();
	const [logTextSt, setlogTextSt] = useState("🔌 Connect hashpack wallet here...");
	const [page, setPage] = useState('home');
	const [isRegistered, setIsRegistered] = useState(false);
	const [user, setUser] = useState(UserType.UNKNOWN);

	async function connectWallet() {
		if (accountId !== undefined) {
			setlogTextSt(`🔌 Account ${accountId} already connected ⚡ ✅`);
		} else {
			const wData = await walletConnectFcn();
			wData[0].pairingEvent.once((pairingData) => {
				pairingData.accountIds.forEach((id) => {
					setAccountId(id);
					console.log(`- Paired account id: ${id}`);
					setlogTextSt(`🔌 Account ${id} connected ⚡ ✅`);
				});
			});
			setWalletData(wData);
		}
	}

	async function changePage(newPage) {
		if(!accountId) {
				setlogTextSt("🔌 Connect wallet first... ⚡ ❌");
				return;
			}
		if(!contractId) {
			setlogTextSt("🔌 No contract deployed... ⚡ ❌");
			return;
		}
		if(user === UserPage[newPage]) {
			setPage(newPage);
			return;
		}
		const loggedUser = await userLogin(walletData, accountId, contractId).catch((e) => UserType.UNKNOWN);
		if(UserPage[newPage] === loggedUser) {
			setIsRegistered(true);
			setPage(newPage);
			setUser(loggedUser);
		} else {
			if(newPage === 'admin') {
				setlogTextSt("🔌 Only admin can access this page... ⚡ ❌");
				return;
			}
			setIsRegistered(false);
			setPage(newPage);
		}
		
	}

	if(page === 'home') {
	return (
			<div className="App">
				<h1 className="header">DAPP for IITM Project Staff</h1>
				<MyLog message={logTextSt} />

				<MyGroup
					fcn={connectWallet}
					buttonLabel={"Connect Wallet"}
				/>

				<MyGroup
					fcn = {() => {
						changePage("admin");
					}}
					buttonLabel = {"Contract Admin"}
				/>

				<MyGroup
					fcn = {() => {
						changePage("staff");
					}}
					buttonLabel = {"Project Staff"}
				/>

				<MyGroup
					fcn = {() => {
						changePage("faculty");
					}}
					buttonLabel = {"IITM Faculty"}
				/>
				<div className="logo">
					<div className="symbol">
						<svg
							id="Layer_1"
							data-name="Layer 1"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 40 40"
						>
							<path d="M20 0a20 20 0 1 0 20 20A20 20 0 0 0 20 0" className="circle"></path>
							<path
								d="M28.13 28.65h-2.54v-5.4H14.41v5.4h-2.54V11.14h2.54v5.27h11.18v-5.27h2.54zm-13.6-7.42h11.18v-2.79H14.53z"
								className="h"
							></path>
						</svg>
					</div>
					<span>Hedera</span>
				</div>
			</div>
		);
	} 
	else if(page === 'admin') {
		return <AdminPage walletData={walletData} accountId={accountId} setPage={setPage} />;
	} 
	else if(page === 'staff') {
		return <StaffPage walletData={walletData} accountId={accountId} contractId={contractId} setPage={setPage} isRegistered={isRegistered} setIsRegistered={setIsRegistered}/>;
	} 
	else if(page === 'faculty') {
		return <FacultyPage walletData={walletData} accountId={accountId} contractId={contractId} setPage={setPage} isRegistered={isRegistered} setIsRegistered={setIsRegistered}/>;
	} 
	return <></>;
}
export default App;
