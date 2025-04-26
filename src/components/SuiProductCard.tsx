import { useState } from 'react';
import { useWallet, ConnectButton } from '@suiet/wallet-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';

export interface SuiProductCardProps {
  price: string;
  recipientAddress: string;
  title: string;
  description: string;
  imageUrl: string;
  artist: string;
  collection: string;
}

const SuiProductCard = ({
  price,
  recipientAddress,
  title,
  description,
  imageUrl,
  artist,
  collection
}: SuiProductCardProps) => {
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  
  // 断开钱包连接
  const handleDisconnect = () => {
    if (wallet.connected) {
      wallet?.disconnect();
    }
  };
  
  // 发送 SUI
  const handlePurchase = async () => {
    if (!wallet.connected) {
      alert("请先连接钱包!");
      return;
    }
    
    try {
      setLoading(true);
      
      // 创建交易
      const tx = new TransactionBlock();
      
      // 添加转账操作
      // 将价格从字符串转换为 MIST 单位 (1 SUI = 10^9 MIST)
      const amountInMist = Math.floor(parseFloat(price) * 1_000_000_000);
      
      // 添加转账操作
      tx.transferObjects([
        tx.splitCoins(tx.gas, [tx.pure(amountInMist)])
      ], tx.pure(recipientAddress));
      
      // 签名并执行交易
      const resData = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx as any
      });
      
      // 交易成功
      alert(`交易成功! ${price} SUI 已发送到 ${recipientAddress}\n交易摘要: ${resData.digest}`);
      
      // 可以在这里添加跳转到 Sui Explorer 的链接
      console.log(`https://explorer.sui.io/txblock/${resData.digest}?network=testnet`);
      console.log('Transaction Result:', resData);
      
    } catch (error) {
      console.error("交易失败:", error);
      alert("交易失败，请查看控制台获取详细信息");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '32%', flex: '0 0 auto' }} className="bg-gradient-to-br from-teal-800/20 to-teal-600/10 rounded-xl overflow-hidden border border-teal-600/30 shadow-lg">
      <div className="relative w-full h-48 overflow-hidden">
        <img
          className="w-full h-full object-cover"
          src={imageUrl}
          alt={title}
        />
        <div className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
          {price} SUI
        </div>
        <div className="bg-gray-700 text-white px-3 py-1 rounded-full text-xs z-10">
          Sui Network
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
            {!wallet.connected ? (
              <div className="flex justify-center">
                <ConnectButton className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition-colors" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-gray-300 truncate">
                  <span>钱包地址: </span>
                  <span className="font-medium text-white">{wallet.account?.address}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePurchase}
                    disabled={loading}
                    className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    {loading ? "处理中..." : `购买 (${price} SUI)`}
                  </button>
                  <button
                    onClick={handleDisconnect}
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

export default SuiProductCard;
