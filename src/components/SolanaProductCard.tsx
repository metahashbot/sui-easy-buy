import { useState, useEffect } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';

export interface SolanaProductCardProps {
  price: string;
  recipientAddress: string;
  title: string;
  description: string;
  imageUrl: string;
  artist: string;
  collection: string;
}

// 定义 Phantom 钱包类型
interface PhantomWindow extends Window {
  solana?: {
    isPhantom?: boolean;
    connect: () => Promise<{ publicKey: { toString: () => string } }>;
    disconnect: () => Promise<void>;
    signAndSendTransaction: (transaction: any) => Promise<any>;
    publicKey: { toString: () => string } | null;
  };
}

declare const window: PhantomWindow;

const SolanaProductCard = ({
  price,
  recipientAddress,
  title,
  description,
  imageUrl,
  artist,
  collection
}: SolanaProductCardProps) => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 检查 Phantom 钱包是否已安装
  const checkIfPhantomInstalled = () => {
    const isPhantomInstalled = window.solana && window.solana.isPhantom;
    return isPhantomInstalled;
  };

  // 检查钱包连接状态
  useEffect(() => {
    if (checkIfPhantomInstalled()) {
      // 如果钱包已连接，设置状态
      if (window.solana && window.solana.publicKey) {
        setWalletConnected(true);
        setPublicKey(window.solana.publicKey.toString());
      }
    }
  }, []);

  // 连接 Phantom 钱包
  const connectWallet = async () => {
    if (!checkIfPhantomInstalled()) {
      alert("请安装 Phantom 钱包扩展!");
      return;
    }

    try {
      setLoading(true);
      if (window.solana) {
        const response = await window.solana.connect();
        setWalletConnected(true);
        setPublicKey(response.publicKey.toString());
      }
    } catch (error) {
      console.error("连接钱包失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 断开钱包连接
  const disconnectWallet = async () => {
    if (window.solana) {
      try {
        setLoading(true);
        await window.solana.disconnect();
        setWalletConnected(false);
        setPublicKey(null);
      } catch (error) {
        console.error("断开钱包失败:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // 发送 SOL
  const handlePurchase = async () => {
    if (!walletConnected || !window.solana || !window.solana.publicKey) {
      alert("请先连接钱包!");
      return;
    }

    try {
      setLoading(true);
      
      // 创建连接到 Solana 开发网络
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      
      // 确保我们有有效的公钥
      if (!publicKey) {
        throw new Error("找不到有效的钱包公钥");
      }
      
      // 创建交易
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(publicKey),
          toPubkey: new PublicKey(recipientAddress),
          lamports: parseFloat(price) * LAMPORTS_PER_SOL
        })
      );
      
      // 设置最近的区块哈希（这是交易所必需的）
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(publicKey);
      
      // 请求用户签名并发送交易
      const signedTransaction = await window.solana.signAndSendTransaction(transaction);
      
      // 等待交易确认
      const confirmation = await connection.confirmTransaction(signedTransaction.signature);
      
      if (confirmation.value.err) {
        throw new Error("交易被拒绝或失败");
      }
      
      // 交易成功
      alert(`交易成功! ${price} SOL 已发送到 ${recipientAddress}\n交易签名: ${signedTransaction.signature}`);
      
      // 可以在这里添加跳转到 Solana Explorer 的链接
      console.log(`https://explorer.solana.com/tx/${signedTransaction.signature}?cluster=devnet`);
      
    } catch (error) {
      console.error("交易失败:", error);
      alert("交易失败，请查看控制台获取详细信息");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '32%', flex: '0 0 auto' }} className="bg-gradient-to-br from-purple-800/20 to-purple-600/10 rounded-xl overflow-hidden border border-purple-600/30 shadow-lg">
      <div className="relative w-full h-48 overflow-hidden">
        <img
          className="w-full h-full object-cover"
          src={imageUrl}
          alt={title}
        />
        <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
          {price} SOL
        </div>
        <div className="bg-gray-700 text-white px-3 py-1 rounded-full text-xs z-10">
          Solana
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
          {description}
        </p>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs text-gray-300">
            <span>Artist</span>
            <span className="font-medium text-white">{artist}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-300">
            <span>Collection</span>
            <span className="font-medium text-white">{collection}</span>
          </div>

          <div className="pt-3 border-t border-gray-700">
            {!walletConnected ? (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? "连接中..." : "连接 Phantom 钱包"}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-gray-300 truncate">
                  <span>钱包地址: </span>
                  <span className="font-medium text-white">{publicKey}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePurchase}
                    disabled={loading}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    {loading ? "处理中..." : `购买 (${price} SOL)`}
                  </button>
                  <button
                    onClick={disconnectWallet}
                    disabled={loading}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    断开
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolanaProductCard;
