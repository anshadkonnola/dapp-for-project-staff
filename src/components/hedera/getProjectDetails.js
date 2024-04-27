import { ContractFunctionParameters, ContractExecuteTransaction } from "@hashgraph/sdk";

async function getProjectDetailsFcn(walletData, accountId, contractId) {
	console.log(`\n=======================================`);
	console.log(`- Getting the project details in the contract...`);

	const hashconnect = walletData[0];
	const saveData = walletData[1];
	const provider = hashconnect.getProvider("testnet", saveData.topic, accountId);
	const signer = hashconnect.getSigner(provider);

	//Execute a contract function (transfer)
	const contractExecTx = await new ContractExecuteTransaction()
		.setContractId(contractId)
		.setGas(3000000)
		.setFunction("getAllProjects", new ContractFunctionParameters())
		.freezeWithSigner(signer);

	const contractExecSign = await contractExecTx.signWithSigner(signer);
	const contractExecSubmit = await contractExecSign.executeWithSigner(signer);
	const contractExecRx = await provider.getTransactionReceipt(contractExecSubmit.transactionId);

  console.log(`- Project details: ${contractExecRx.returnValues[0]}`);

	return contractExecRx.returnValues[0];
}

export default getProjectDetailsFcn;