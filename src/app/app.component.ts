import { Component, OnInit } from '@angular/core';
import { ethers } from "ethers";
import { wethAbi } from "./utils/wethAbi";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  wethContract: any;
  provider: any;
  wallet: string = '';
  contractAddress = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6';
  transactionCount: number | undefined;
  transactionList: { url: string; label: string; }[] = [];

  async ngOnInit() {
    this.provider = new ethers.providers.Web3Provider(window.ethereum, 5);
    const wallets = await this.provider.send("eth_requestAccounts", []);
    this.wallet = wallets[0];
    await this.setTransactionCount();
    this.wethContract = new ethers.Contract(this.contractAddress, wethAbi, this.provider.getSigner());
  }

  async approve(): Promise<void> {
    const oneWei = ethers.utils.parseUnits('1.0', 'wei');

    try {
      const transaction = await this.wethContract.approve(this.contractAddress, oneWei);
      this.updateTransactionList(transaction.hash);
      this.provider.once(transaction.hash, (transactionInfo: any) => {
        if (transactionInfo.confirmations > 0) {
          this.setTransactionCount();
        }
      });
    } catch (err) {
      alert(err);
    }
  }

  async setTransactionCount(): Promise<void> {
    this.transactionCount = await this.provider.getTransactionCount(this.wallet);
  }

  updateTransactionList(transactionHash: string): void {
    const newTransaction = {
      url: `https://goerli.etherscan.io/tx/${transactionHash}`,
      label: transactionHash
    }

    this.transactionList.push(newTransaction);
  }
}
