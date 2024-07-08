import { useState, useEffect } from "react";
import { ethers } from "ethers";
import assessmentAbi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [assessment, setAssessment] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const assessmentABI = assessmentAbi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccounts(accounts);
    }
  };

  const handleAccounts = (accounts) => {
    if (accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccounts(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getAssessmentContract();
  };

  const getAssessmentContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const assessmentContract = new ethers.Contract(contractAddress, assessmentABI, signer);

    setAssessment(assessmentContract);
  };

  const fetchBalance = async () => {
    if (assessment) {
      try {
        const balance = await assessment.getBalance();
        const formattedBalance = ethers.utils.formatUnits(balance, 'ether');
        setBalance(parseFloat(formattedBalance).toFixed(4)); // Limiting to 4 decimal places
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }
  };

  const deposit = async () => {
    if (assessment) {
      try {
        const tx = await assessment.deposit(ethers.utils.parseEther(depositAmount), { value: ethers.utils.parseEther(depositAmount) });
        await tx.wait();
        fetchBalance();
        setDepositAmount("");
      } catch (error) {
        console.error("Error depositing funds:", error);
      }
    }
  };

  const withdraw = async () => {
    if (assessment) {
      try {
        const tx = await assessment.withdraw(ethers.utils.parseEther(withdrawAmount));
        await tx.wait();
        fetchBalance();
        setWithdrawAmount("");
      } catch (error) {
        console.error("Error withdrawing funds:", error);
      }
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install MetaMask to use this application.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return (
        <button className="button" onClick={connectAccount}>
          Connect MetaMask Wallet
        </button>
      );
    }

    if (balance === undefined) {
      fetchBalance();
    }

    return (
      <div className="account-info">
        <p><strong>Account:</strong> {account}</p>
        <p><strong>Balance:</strong> {balance} ETH</p>
        <div className="input-group">
          <input 
            type="text" 
            placeholder="Amount to deposit" 
            value={depositAmount} 
            onChange={(e) => setDepositAmount(e.target.value)} 
          />
          <button className="button deposit-button" onClick={deposit}>Deposit</button>
        </div>
        <div className="input-group">
          <input 
            type="text" 
            placeholder="Amount to withdraw" 
            value={withdrawAmount} 
            onChange={(e) => setWithdrawAmount(e.target.value)} 
          />
          <button className="button withdraw-button" onClick={withdraw}>Withdraw</button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to Sandeep's Contract!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #f0f4f8;
          padding: 20px;
        }
        header {
          margin-bottom: 30px;
        }
        h1 {
          color: #333;
          font-size: 2.5em;
          margin: 0;
          text-align: center;
        }
        .account-info {
          background: #fff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          text-align: center;
          width: 100%;
          max-width: 400px;
        }
        p {
          font-size: 1.2em;
          margin: 15px 0;
          color: #555;
        }
        .input-group {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 10px 0;
        }
        .input-group input {
          padding: 10px;
          font-size: 1em;
          border: 1px solid #ddd;
          border-radius: 5px;
          margin-right: 10px;
          flex: 1;
        }
        .button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          font-size: 1em;
          cursor: pointer;
          border-radius: 5px;
          transition: background-color 0.3s, transform 0.3s;
        }
        .button:hover {
          background-color: #0056b3;
          transform: scale(1.05);
        }
        .deposit-button {
          background-color: #28a745;
        }
        .deposit-button:hover {
          background-color: #218838;
        }
        .withdraw-button {
          background-color: #dc3545;
        }
        .withdraw-button:hover {
          background-color: #c82333;
        }
      `}</style>
    </main>
  );
}
