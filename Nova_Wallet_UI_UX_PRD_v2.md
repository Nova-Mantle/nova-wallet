# PRODUCT REQUIREMENT DOCUMENT
# Nova Wallet - ChatGPT for Crypto

**Version:** 2.0 - UI/UX Brief  
**Date:** November 30, 2025  
**Owner:** Product Team  
**Purpose:** UI/UX Design Briefing

---

## 📋 DAFTAR ISI

1. [Product Overview](#product-overview)
2. [Siapa User Kita](#siapa-user-kita)
3. [Interface Concept](#interface-concept)
4. [Core Features](#core-features)
5. [User Flow](#user-flow)
6. [Screen Requirements](#screen-requirements)
7. [Design Principles](#design-principles)
8. [References & Inspiration](#references-inspiration)
9. [Success Metrics](#success-metrics)
10. [Deliverables Expected](#deliverables-expected)
11. [Out of Scope (Not in MVP)](#out-of-scope-not-in-mvp)
12. [Future Roadmap](#future-roadmap)

---

## 1. PRODUCT OVERVIEW

### Apa itu Nova Wallet?

Nova Wallet adalah **ChatGPT untuk crypto** - interface utama adalah **chat** dimana user bisa:
- Tanya apa aja tentang crypto & blockchain
- Execute transaksi (send, swap, dll)
- Explore on-chain data
- Dapat insight dari AI

**Ini bukan wallet baru.** Nova adalah **orchestrator** - user tetap pakai wallet existing (MetaMask, Phantom, dll), Nova cuma jadi interface pintar di atasnya.

### Masalah yang Diselesaikan

**Problem 1: Wallet Interface Ribet**
- Terlalu banyak menu, button, tab
- User bingung mau ngapain
- Untuk simple task (cek saldo) harus klik berkali-kali

**Problem 2: Address Blindness**
- User ga tau "gue lagi kirim ke siapa sih?"
- Address `0xABC...789` meaningless
- Takut salah kirim tapi ga ada cara validate

**Problem 3: On-Chain Data Hard to Access**
- Mau tau "address ini beli token apa aja?" → harus ke Etherscan
- Mau cari "NFT wash traders" → harus manual analyze
- Info ada tapi susah dicari & dibaca

**Problem 4: Hidden Costs**
- Slippage ga diprediksi
- Invisible fees muncul tiba-tiba
- User sering overpay tanpa sadar

### Solusi Nova

✅ **Chat-first interface** - Semua bisa dilakukan via chat  
✅ **Address Intelligence** - AI jelasin siapa/apa address ini  
✅ **On-Chain Search** - Tanya apa aja, AI cari di blockchain  
✅ **Smart Cost Prediction** - AI predict slippage & fees akurat  
✅ **QRIS → Crypto** - Terima payment Rupiah, dapat crypto  

### Unique Selling Point

**"Ngobrol sama AI untuk kontrol semua wallet crypto kamu"**

---

## 2. SIAPA USER KITA

### Primary Users

**1. Curious Crypto Enthusiast (Usia 22-32)**
- Sudah punya wallet, aktif trading
- Suka explore on-chain data (whale watching, token hunting)
- Frustrated dengan Etherscan yang technical
- **Need:** Easy way untuk explore blockchain data via natural language

**2. Busy Trader (Usia 25-40)**
- Multiple wallets, frequent transactions
- Mau speed + efficiency
- Ga mau klik-klik banyak menu
- **Need:** Fast execution, one interface untuk semua

**3. Freelancer/Creator (Usia 25-35)**
- Terima payment internasional
- Client ga ngerti crypto
- **Need:** Easy payment link (QRIS → Crypto)

### User Personas

**Persona 1: Andi - The On-Chain Explorer**
- 27 tahun, Crypto Analyst
- Suka research on-chain data
- Tiap hari cek whale movements, new token launches
- Quote: *"Capek banget bolak-balik Etherscan, Dextools, Nansen..."*

**Persona 2: Sarah - The Multi-Wallet Juggler**
- 32 tahun, DeFi Power User
- 5 wallets across different chains
- Execute 10-20 transactions per day
- Quote: *"Ribet banget buka MetaMask, Phantom, Keplr bergantian..."*

**Persona 3: Budi - The Freelance Dev**
- 28 tahun, Frontend Developer
- Client dari US & Europe
- Quote: *"Pengen banget terima crypto tapi client ga mau ribet install wallet"*

---

## 3. INTERFACE CONCEPT

### Layout Structure

**Desktop/Tablet:**
```
┌──────────────────────────────────────────────────────────┐
│  Logo                                    [Connect Wallet] │
├──────────┬───────────────────────────────────────────────┤
│          │                                               │
│ SIDEBAR  │           MAIN CHAT AREA                      │
│          │                                               │
│ Portfolio│  ┌────────────────────────────────────────┐   │
│ Info     │  │ User: "Cek saldo ETH aku"              │   │
│          │  └────────────────────────────────────────┘   │
│ $1,247   │                                               │
│          │  ┌────────────────────────────────────────┐   │
│ ETH $850 │  │ Nova AI: "Kamu punya 0.35 ETH          │   │
│ USDT $250│  │          ($850)"                       │   │
│ SOL $147 │  └────────────────────────────────────────┘   │
│          │                                               │
│ [Send]   │  ┌────────────────────────────────────────┐   │
│ [Swap]   │  │ [Type your message...]           [→]  │   │
│ [Paylink]│  └────────────────────────────────────────┘   │
│          │                                               │
└──────────┴───────────────────────────────────────────────┘
```

**Key Points:**
- **Sidebar:** Portfolio info + quick actions (always visible)
- **Main area:** Chat interface (full focus)
- **NO chat history** - Clean slate tiap session
- **Responsive:** Mobile = chat full screen, portfolio jadi modal/bottom sheet

---

### Mobile Layout

```
┌─────────────────────────┐
│ Nova    ☰    [Connect] │ ← Header
├─────────────────────────┤
│                         │
│  User: "Cek saldo"      │
│                         │
│  Nova: "Total $1,247"   │
│  • ETH: $850           │
│  • USDT: $250          │ ← Chat Area
│  • SOL: $147           │
│                         │
│  User: "Kirim 0.1 ETH" │
│                         │
│  Nova: [Preview card]  │
│                         │
├─────────────────────────┤
│ [Message...]      [→]  │ ← Input
└─────────────────────────┘

[☰ Menu opens sidebar overlay:]
┌─────────────────────────┐
│ Portfolio               │
│ Total: $1,247          │
│ ──────────────────────  │
│ ETH    $850            │
│ USDT   $250            │
│ SOL    $147            │
│ ──────────────────────  │
│ [Send] [Swap] [Paylink]│
│                         │
│ [Connected: 0xABC...]  │
└─────────────────────────┘
```

---

## 4. CORE FEATURES

### Feature 1: AI Chat Interface (ChatGPT-like)

**Konsep:**
User bisa ngobrol tentang **apa aja** related to crypto. AI ngerti & execute.

**Capabilities:**

**A. Portfolio & Balance**
```
User: "Berapa saldo aku?"
AI: "Total portfolio: $1,247
     • ETH: 0.35 ($850)
     • USDT: 250
     • SOL: 5.2 ($147)"

User: "Gimana performa SOL aku?"
AI: "SOL kamu naik 12% hari ini! 🚀
     Beli di $28.3, sekarang $31.7
     Profit: +$17
     
     Mau take profit?"
```

**B. Transactions**
```
User: "Kirim 100 USDT ke Budi"
AI: "Ke address mana?
     • 0xABC...789 (Polygon) - sering dipakai
     • 0xDEF...456 (Ethereum)
     
     Atau mau input address baru?"

User: "Yang Polygon"
AI: [Shows transaction preview card]
    "
    💸 Kirim: 100 USDT
    📍 Ke: 0xABC...789
    ⛓️ Network: Polygon
    ⛽ Gas: $0.02
    
    [Cancel] [Confirm]
    "
```

**C. Explanations**
```
User: "Apa itu slippage?"
AI: "Slippage itu selisih antara harga yang kamu expect 
     vs harga final saat transaksi jalan.
     
     Contoh:
     • Kamu mau swap 1 ETH = $2,500
     • Tapi karena market movement, dapetnya cuma $2,480
     • Slippage = $20 (0.8%)
     
     Di Nova, AI prediksi slippage optimal buat kamu!"
```

**UI Components:**
- Chat message bubbles (user = right, AI = left)
- Transaction preview cards (embedded in chat)
- Quick suggestion chips ("Cek saldo", "Kirim crypto", "Swap")
- Loading indicator (typing animation)

---

### Feature 2: Portfolio Analysis

**Konsep:**
User bisa melihat portfolio lengkap wallet mereka, termasuk native token dan ERC-20 tokens, nilai USD, dan profit/loss.

**Example 1: Analyze Own Portfolio**
```
User: "Analisis portfolio aku"

AI: [Shows PortfolioCard]
    
    📊 Portfolio Overview
    
    Total Value: $1,247.50
    📈 +8.2% (24h)
    
    Native Token:
    • 0.35 ETH ($850)
    
    Token Holdings:
    • 250 USDT ($250)
    • 147 LINK ($147)
    
    Chain: Ethereum Mainnet
```

**Example 2: Analyze Any Address**
```
User: "Analyze address 0xABC...789"

AI: [Shows PortfolioCard for that address]
    
    📊 Portfolio: 0xABC...789
    
    Total Value: $12,500
    
    Holdings breakdown...
```

**Data Sources:**
- Multi-chain balance API
- Token price feeds
- Blockchain RPC endpoints

**UI Components:**
- PortfolioCard (total value, token list, 24h change)
- MultiChainBalanceCard (all chains overview)

> **📌 Note:** Advanced Address Intelligence (activity tracking, protocol interactions, risk analysis) planned for **Phase 2 - Intelligence Layer**.

---

### Feature 3: On-Chain Search

**Konsep:**
User bisa query data on-chain untuk wallet mereka seperti aktivitas trading dan statistik transaksi.

**Example Queries:**

**A. Token Activity (Trading P&L)**
```
User: "Profit aku berapa?"

AI: [Shows TokenActivityCard]
    
    📊 Trading Activity Summary
    
    Total Tokens Traded: 5
    Total P&L: +$260 (+5.8%)
    
    Top Gainers:
    • PEPE: +12% ($300 profit)
    • LINK: +8% ($120 profit)
    
    Top Losers:
    • SHIB: -4% ($50 loss)
    
    Chain: Ethereum
```

**B. Transaction Statistics**
```
User: "Berapa gas yang sudah aku habiskan?"

AI: [Shows TransactionStatsCard]
    
    ⛽ Transaction Statistics
    
    Total Transactions: 245
    Total Gas Spent: 0.35 ETH ($850)
    
    Average Gas per Tx: $3.47
    Most Active Day: Monday
    
    Last 30 Days:
    • 45 transactions
    • 0.08 ETH gas spent
```

**Data Sources:**
- Blockchain RPC endpoints
- Transaction history API
- Token price feeds

**UI Components:**
- TokenActivityCard (trading summary, P&L)
- TransactionStatsCard (gas usage, tx count)

> **📌 Note:** Advanced On-Chain Search (whale watching, NFT analysis, contract mentions) planned for **Phase 2 - Intelligence Layer**.

---

### Feature 4: Smart Cost Prediction

**Konsep:**
AI predict **actual** execution cost (bukan cuma gas fee estimate).

**Sudah ada:** ML model untuk predict slippage based on 30+ market features

**What AI Shows:**

**A. Before Swap**
```
User: "Swap 10 ETH jadi USDT"

AI: "Analyzing market conditions...
    
    💱 Best Route: Uniswap V3
    
    Estimated Execution:
    • Expected: 10 ETH → $25,000 USDT
    • Slippage: 0.37% ($92.50)
    • Gas fee: $15
    • Final: ~$24,892.50 USDT
    
    💡 AI Recommendation:
       Market depth bagus, slippage rendah.
       Good time to execute!
    
    Alternative routes:
    • Sushiswap: $24,850 (worse)
    • 1inch: $24,880 (worse)
    
    [Proceed with Uniswap] [Compare Routes]"
```

**B. Gas Fee Optimization**
```
User: "Kirim 100 USDT"

AI: "Gas fee saat ini:
    
    ⛽ Current: $8.50 (HIGH)
    
    📊 Historical pattern:
    • Average: $2-4
    • Peak: $15 (during US trading hours)
    • Low: $1-2 (2am-6am UTC)
    
    💡 Recommendation:
       Tunggu 3 jam → save ~$5 (60%)
       
       Or use Polygon → $0.02 gas
    
    [Wait] [Use Polygon] [Send Now Anyway]"
```

**UI Components:**
- Cost breakdown card
- Gas fee chart (current vs historical)
- Route comparison table
- Recommendation banner

---

### Feature 5: Wallet Paylink (Fiat → Crypto)

**Konsep:**
Freelancer buat payment link, client bayar fiat, freelancer terima crypto.

**Dual Payment Method:**
- 🇮🇩 **Indonesia:** QRIS via Midtrans (Rupiah → Crypto)
- 🌐 **Global:** Transak (USD/EUR/etc → Crypto)

**Create via Chat:**
```
User: "Buat paylink 0.1 ETH"

AI: [Shows CreatePaymentForm]
    
    💳 Create Payment Link
    
    Amount: 0.1
    Token: [ETH ▼]
    Network: [Ethereum ▼]
    Wallet Penerima: 0xABC...789
    
    [Generate Payment Link]
```

**After Creation:**
```
AI: [Shows PaymentStatusCard]
    
    ✨ Your Paylink is Ready!
    
    ┌─────────────┐
    │  QR CODE    │
    └─────────────┘
    
    Link: nova.app/pay/ABC123
    
    Amount: 0.1 ETH (~$250)
    Status: Waiting for payment
    
    [Copy Link] [Open Link]
```

**Client Experience (Indonesia):**
```
[Client opens link → Detected as Indonesia]

┌─────────────────────────┐
│ Bayar ke @wildanniam    │
│                         │
│ Amount: Rp 3,850,000    │
│ You receive: 0.1 ETH    │
│                         │
│ [QR CODE - QRIS]        │
│                         │
│ Scan dengan:            │
│ GoPay • OVO • Dana      │
│ BCA • BRI • Mandiri     │
└─────────────────────────┘
```

**Client Experience (Global):**
```
[Client opens link → Non-Indonesia]

┌─────────────────────────┐
│ Pay to @wildanniam      │
│                         │
│ Amount: $250 USD        │
│ You receive: 0.1 ETH    │
│                         │
│ [Transak Widget]        │
│ Card • Bank Transfer    │
│ Apple Pay • Google Pay  │
└─────────────────────────┘
```

**After Payment:**
```
Nova AI: "💰 Payment received!
          
          Converting fiat → 0.1 ETH...
          Est. 3-5 minutes
          
          [Track Status →]"

[Processing complete]

Nova AI: "✅ Done!
          
          0.1 ETH delivered to your wallet
          Tx: 0x7d3f2a...
          
          [View Transaction →]"
```

**UI Components:**
- CreatePaymentForm (in chat)
- PaymentStatusCard (QR code, link, status)
- Client-facing payment page (`/pay/[paymentId]`)
- Real-time status polling

---

## 5. USER FLOW

### Flow 1: First Time User

**Goal:** Download → Connect Wallet → First Interaction

```
1. Open Nova Wallet
   ↓
2. Landing/Welcome Screen
   "ChatGPT untuk Crypto"
   [Connect Wallet]
   ↓
3. Select Wallet
   [MetaMask] [Phantom] [WalletConnect]
   ↓
4. Wallet Connection
   Popup di wallet → Approve
   ↓
5. Connected! ✅
   Auto redirect ke chat
   ↓
6. Quick Tutorial (Optional)
   AI: "Hai! Aku Nova. Kamu bisa tanya apa aja atau
        eksekusi transaksi langsung via chat.
        
        Try:
        • 'Cek saldo aku'
        • 'Info address 0xABC...'
        • 'Kirim 0.1 ETH ke...'
        
        [Skip] [Continue]"
   ↓
7. Ready!
   User starts chatting
```

**Time:** <2 menit

---

### Flow 2: Check Address Before Sending

**Goal:** User validate address sebelum kirim

```
1. User di Chat
   "Kirim 1 ETH ke 0xABC...789"
   ↓
2. AI Analyzing Address
   "Hold on, cek address dulu..."
   ↓
3. AI Shows Address Info
   "
   Address 0xABC...789:
   • Active trader (50 txs/month)
   • Holds 10 ETH + tokens
   • Last active: 1 hour ago
   • First seen: Jan 2023
   
   Looks normal ✅
   "
   ↓
4. AI Shows Transaction Preview
   "
   Send 1 ETH to 0xABC...789
   Gas: $2.50
   Total: ~1.001 ETH
   
   [Cancel] [Confirm]
   "
   ↓
5. User Confirms
   ↓
6. Wallet Popup
   MetaMask approval
   ↓
7. Transaction Sent
   AI: "✅ Transaction sent!
        Hash: 0x7d3f..."
```

---

### Flow 3: On-Chain Research

**Goal:** User explore blockchain data via chat

```
1. User Ask Question
   "Token apa yang whale 0xDEF...456 beli minggu ini?"
   ↓
2. AI Searching
   "Searching on-chain data across all chains..."
   ↓
3. AI Shows Results
   "
   Found 8 token purchases:
   
   1. LINK - 50K tokens ($800K)
   2. AAVE - 10K tokens ($650K)
   ...
   
   Total spent: $2.3M
   "
   ↓
4. User Follow-up
   "Detail tentang LINK purchase"
   ↓
5. AI Shows Detail
   "
   LINK Purchase:
   • Amount: 50,000 LINK
   • Price: $16/LINK
   • Total: $800,000
   • Date: Nov 25, 2025
   • Tx: 0xabc...
   • DEX: Uniswap V3
   
   Current price: $17.20
   Unrealized P&L: +$60,000 (+7.5%)
   "
```

---

### Flow 4: Create Paylink

**Goal:** Freelancer buat payment link untuk client

```
1. User in Chat
   "Buat paylink 500 ribu"
   ↓
2. AI Asks Details
   "Terima crypto apa?
    [USDT] [ETH] [SOL] [BTC]"
   ↓
3. User Selects
   Tap: [USDT]
   ↓
4. AI Shows Preview
   "
   Client bayar: Rp 500,000
   Kamu terima: ~32.5 USDT
   Fee: 4.5% (Rp 22,500)
   
   [Cancel] [Create]
   "
   ↓
5. User Confirms
   [Create]
   ↓
6. Paylink Created
   AI shows:
   • QR code
   • Short link
   • Share buttons
   ↓
7. User Shares to Client
   Copy link → Send via WhatsApp
   ↓
8. Client Pays
   (Client flow)
   ↓
9. User Notified
   "💰 Payment received! Converting..."
   ↓
10. Crypto Delivered
    "✅ 32.5 USDT delivered!"
```

---

## 6. SCREEN REQUIREMENTS

### Main Screen: Chat Interface

**Layout:**

**Desktop:**
```
┌──────────────────────────────────────────────────────────┐
│  Nova                                    [Connect Wallet] │
├────────┬─────────────────────────────────────────────────┤
│        │                                                 │
│ $1,247 │  ┌──────────────────────────────────────────┐   │
│        │  │ Nova: "Hai! Ada yang bisa aku bantu?"   │   │
│ Assets │  └──────────────────────────────────────────┘   │
│ ────── │                                                 │
│ ETH    │       ┌───────────────────────────┐             │
│ $850   │       │ User: "Cek saldo aku"     │             │
│        │       └───────────────────────────┘             │
│ USDT   │                                                 │
│ $250   │  ┌──────────────────────────────────────────┐   │
│        │  │ Nova: "Total portfolio: $1,247          │   │
│ SOL    │  │       • ETH: 0.35 ($850)                │   │
│ $147   │  │       • USDT: 250                       │   │
│        │  │       • SOL: 5.2 ($147)"                │   │
│────────│  └──────────────────────────────────────────┘   │
│        │                                                 │
│ [Send] │  ┌─ Quick Actions ─────────────────────────┐   │
│ [Swap] │  │ Cek Saldo | Kirim | Swap | Info Address│   │
│[Paylink│  └──────────────────────────────────────────┘   │
│        │                                                 │
│        │  ┌──────────────────────────────────────────┐   │
│        │  │ [Type your message...]             [→]  │   │
│        │  └──────────────────────────────────────────┘   │
└────────┴─────────────────────────────────────────────────┘
```

**Mobile:**
```
┌─────────────────────────┐
│ Nova  ☰       [Connect] │
├─────────────────────────┤
│                         │
│ Nova: "Hai! Aku Nova"   │
│       "Tanya apa aja!"  │
│                         │
│    ┌────────────────┐   │
│    │ User: "Cek     │   │
│    │       saldo"   │   │
│    └────────────────┘   │
│                         │
│ Nova: "Total: $1,247"   │
│       "• ETH: $850"     │
│       "• USDT: $250"    │
│       "• SOL: $147"     │
│                         │
│ [Cek Saldo][Kirim]...   │
│                         │
│ (scroll untuk history)  │
│                         │
├─────────────────────────┤
│ [Message...]      [→]  │
└─────────────────────────┘
```

**Components:**

1. **Sidebar (Desktop only)**
   - Portfolio value (large, prominent)
   - Top 3-5 assets (token, value)
   - Quick action buttons
   - Wallet address (shortened, copyable)

2. **Chat Area**
   - AI messages (left, gray bubble)
   - User messages (right, blue bubble)
   - Timestamp (subtle)
   - Special cards (transaction preview, address info, etc)

3. **Quick Actions Bar**
   - Horizontal scroll chips
   - Common actions pre-typed
   - Tap to insert into input

4. **Input Area**
   - Text field (multi-line support)
   - Send button
   - Character counter (optional)

**Important:**
- ❌ NO chat history saved
- ❌ NO previous messages on refresh
- ✅ Clean slate every session

---

### Component: Transaction Preview Card

**In Chat:**
```
┌─────────────────────────────────────┐
│ 💸 Send Transaction                 │
│                                     │
│ Amount:      100 USDT               │
│ To:          0xABC...789            │
│ Network:     Polygon                │
│ Gas Fee:     $0.02 (optimal) ✅     │
│ Slippage:    N/A                    │
│ Total:       ~100.02 USDT           │
│                                     │
│ ⚡ AI Insight:                      │
│ Address aktif, gas optimal.         │
│ Good to go!                         │
│                                     │
│ [Cancel]           [Confirm Send]   │
└─────────────────────────────────────┘
```

**Design Notes:**
- Clear visual hierarchy (amount paling prominent)
- Color coding (green = good, yellow = caution, red = warning)
- Action buttons bottom
- Dismissable (tap outside or [X])

---

### Component: Address Info Card

**Expandable in Chat:**
```
┌─────────────────────────────────────┐
│ 📍 Address: 0xABC...789             │
│                              [Copy] │
├─────────────────────────────────────┤
│                                     │
│ 📊 Activity:                        │
│ • 245 transactions (all time)       │
│ • 30 transactions (last 30 days)    │
│ • Last active: 2 hours ago          │
│                                     │
│ 💰 Holdings:                        │
│ • 5.2 ETH ($12,500)                 │
│ • 10,000 USDT                       │
│ • 50 LINK ($850)                    │
│                                     │
│ 🔗 Top Protocols:                   │
│ • Uniswap (128 txs)                 │
│ • Aave (45 txs)                     │
│ • Curve (12 txs)                    │
│                                     │
│ 📅 First Seen: Jan 15, 2023         │
│                                     │
│ [View on Etherscan →]               │
└─────────────────────────────────────┘
```

---

### Component: On-Chain Search Results

**List in Chat:**
```
┌─────────────────────────────────────┐
│ 🔍 Search: "Top ETH whales today"   │
├─────────────────────────────────────┤
│                                     │
│ 1. 0x742...d4e                      │
│    5,000 ETH moved ($12M)           │
│    → to Binance (selling?)          │
│    [View Details →]                 │
│                                     │
│ 2. 0x28c...7ef                      │
│    3,200 ETH moved ($7.8M)          │
│    → to DeFi protocols              │
│    [View Details →]                 │
│                                     │
│ 3. 0x1f9...a2b                      │
│    2,800 ETH moved ($6.9M)          │
│    → internal transfers             │
│    [View Details →]                 │
│                                     │
│ ... (7 more)                        │
│                                     │
│ [Load More] [Export Data]           │
└─────────────────────────────────────┘
```

---

### Component: Sidebar Portfolio (Desktop)

```
┌──────────────────┐
│ Portfolio        │
├──────────────────┤
│                  │
│   $1,247.50      │  ← Large, prominent
│   +$94 (+8.2%)   │  ← 24h change
│                  │
│ ━━━━━━━━━━━━━━━ │  ← Mini chart (sparkline)
│                  │
├──────────────────┤
│ Assets           │
├──────────────────┤
│                  │
│ Ξ ETH            │
│ 0.35      $850   │  ← Token, amount, value
│                  │
│ 💵 USDT          │
│ 250       $250   │
│                  │
│ ◎ SOL            │
│ 5.2       $147   │
│                  │
│ [View All →]     │
│                  │
├──────────────────┤
│ Quick Actions    │
├──────────────────┤
│                  │
│ [   Send   ]     │  ← Action buttons
│ [   Swap   ]     │
│ [ Paylink  ]     │
│                  │
├──────────────────┤
│                  │
│ 🟢 Connected     │  ← Status
│ 0xABC...789      │  ← Address
│ [Disconnect]     │
│                  │
└──────────────────┘
```

**Mobile Version:**
- Sidebar becomes **bottom sheet** (swipe up)
- Or **hamburger menu** overlay

---

## 7. DESIGN PRINCIPLES

### 1. Chat-First, Everything Else Secondary

**The chat is the product.** Semua interaksi harus bisa dilakukan via chat.

**Bad:**
```
User harus:
1. Klik menu "Send"
2. Pilih token dari dropdown
3. Input amount
4. Input address
5. Confirm
```

**Good:**
```
User ketik:
"Kirim 100 USDT ke Budi" → Done
```

**Sidebar adalah supporting info**, bukan main interface.

---

### 2. No History = Clean Mental Model

**Kenapa no history?**
- ✅ Setiap session fresh start
- ✅ No clutter dari old messages
- ✅ Fokus ke current task
- ✅ Privacy (no conversation logs)

**User bisa screenshot** kalau mau save info.

---

### 3. Proactive, Not Reactive

AI should **anticipate** needs, not just respond.

**Example:**
```
User: "Kirim 1 ETH ke 0xABC..."

AI: "✋ Wait!
     
     Gas fee saat ini $25 (HIGH)
     Biasanya cuma $3-5
     
     Mau tunggu 2 jam? (save $20)"
```

AI kasih **context & recommendations** tanpa diminta.

---

### 4. Transparency in Uncertainty

Kalau AI ga yakin, **bilang terus terang**.

**Example:**
```
User: "Address ini scam ga?"

AI: "❓ Susah dipastikan.
     
     Yang aku lihat:
     • Address baru (created 3 days ago)
     • Cuma 2 transactions
     • No DeFi history
     
     ⚠️ Bukan berarti scam, tapi be careful.
        Double-check dengan sender langsung."
```

Better honest than overconfident.

---

### 5. Speed Matters

User ga mau nunggu lama.

**Goals:**
- Chat response: <2 seconds
- Address lookup: <3 seconds
- On-chain search: <5 seconds
- Transaction execution: Follow wallet speed

**Show progress:**
```
"Searching on-chain data... 🔍"
"Found 245 transactions, analyzing..."
"Done! Here's what I found:"
```

---

### 6. Mobile-Optimized (But Desktop-First Design)

Design untuk **desktop first** (lebih space), tapi ensure **mobile works great**.

**Mobile adaptations:**
- Sidebar → Bottom sheet/Menu
- Multi-column → Single column
- Hover states → Tap states
- Keyboard shortcuts → Gesture shortcuts

---

## 8. REFERENCES & INSPIRATION

### Design Inspiration

**For Chat Interface:**
- ✅ **ChatGPT** - Clean conversation UI, message bubbles, input area
- ✅ **Claude.ai** - Minimal, focus on content
- ✅ **Perplexity** - Search results in chat

**For Crypto Wallet:**
- ✅ **Phantom** - Beautiful, simple
- ✅ **Rainbow** - Colorful, friendly
- ❌ MetaMask - Too technical, avoid

**For Data Display:**
- ✅ **Dune Analytics** - Clean tables & charts
- ✅ **Nansen** - Wallet analytics layout
- ✅ **Arkham** - On-chain investigation UI

**For Sidebar:**
- ✅ **VSCode** - Collapsible sidebar
- ✅ **Figma** - Layers panel
- ✅ **Notion** - Clean navigation

---

### Visual Style

**Color Palette:**

Primary: Blue (#0066FF) - Trust, technology  
Secondary: Purple (#7C3AED) - AI, innovation  
Success: Green (#10B981)  
Warning: Orange (#F59E0B)  
Error: Red (#EF4444)  
Neutral: Gray (#F9FAFB → #111827)

**Typography:**

Primary: Inter / SF Pro / Plus Jakarta Sans  
Monospace: JetBrains Mono (for addresses/hashes)

Heading 1: 32px bold  
Heading 2: 24px semibold  
Body: 16px regular  
Small: 14px regular  
Caption: 12px regular

**Spacing:**

Use 8px grid system:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

---

### Components Library

**Use existing:**
- shadcn/ui (React components)
- Radix UI (Headless components)
- Lucide Icons (Icon set)

**Custom components needed:**
- Chat bubble (message)
- Transaction preview card
- Address info card
- Search results list
- Portfolio widget

---

## 9. SUCCESS METRICS

### Usability

- ✅ Time to first interaction: <30 seconds
- ✅ Task success rate: >90%
- ✅ Error rate: <5%
- ✅ Chat response time: <2 seconds avg

### Engagement

- ✅ Messages per session: >5
- ✅ Daily active users: >30%
- ✅ AI usage rate: >80% of transactions via chat
- ✅ Feature discovery: >60% users try on-chain search

### Quality

- ✅ NPS Score: >50
- ✅ Support tickets: <3% users
- ✅ Crash rate: <0.5%
- ✅ Accessibility: WCAG 2.1 AA

---

## 10. DELIVERABLES EXPECTED

### Phase 1: Wireframes (Week 1-2)
- Low-fi wireframes (all key flows)
- User flow diagrams
- Information architecture

### Phase 2: Visual Design (Week 3-4)
- High-fi mockups (desktop + mobile)
- Component library
- Design system (colors, typography, spacing)

### Phase 3: Prototype (Week 5)
- Interactive Figma prototype
- Key flows clickable
- Animations defined

### Phase 4: Handoff (Week 6)
- Dev-ready specs
- Component documentation
- Asset export

---

## 11. OUT OF SCOPE (NOT in MVP)

**Not in Phase 1 (Foundation):**

❌ Chat history persistence  
❌ Multi-language (English only for now)  
❌ Voice input  
❌ Advanced charting  
❌ Portfolio rebalancing suggestions  
❌ Social features (share, follow)  
❌ Mobile native app (web only)  
❌ Browser extension  
❌ DEX swap aggregator (planned for Phase 2)  
❌ Advanced address intelligence (planned for Phase 2)  
❌ Whale watching & NFT analysis (planned for Phase 2)  

**Focus:** Get chat + core features right first.

---

## 12. FUTURE ROADMAP

### Phase 1: Foundation (Months 1-4) ✅ CURRENT

**Core Capabilities:**
- AI chat wallet (intent → execution)
- Send & receive via natural language
- Wallet connection & portfolio view
- Transaction preview & gas prediction
- AI on-chain search (basic - token activity, tx stats)
- Paylink (fiat → crypto via partners: Midtrans QRIS + Transak)
- Beta launch & UX validation

**Key Metrics:**
- Working MVP with chat-first interface
- Multi-chain support (EVM chains)
- Fiat on-ramp integration

---

### Phase 2: Intelligence Layer (Months 5-9)

**Advanced AI Features:**
- Context-before-execution (proactive warnings)
- Address & risk intelligence
- AI slippage & cost prediction (advanced ML)
- Smart recommendations
- Assisted swap (aggregator-based)
- Wallet health insights
- Nova AI API (developer access)

**Key Metrics:**
- Improved transaction success rate
- Reduced user errors
- Developer ecosystem growth

---

### Phase 3: Automation & Distribution (Month 10+)

**Expansion & Automation:**
- WhatsApp & Telegram execution
- Smart alerts & automation
- Conditional & scheduled transactions
- Gas optimization bot
- Embedded Nova agent (SDK for dApps)
- Developer SDK
- Enterprise partnerships

**Key Metrics:**
- Cross-platform reach
- Automated transaction volume
- Enterprise adoption

---

**Questions?** Contact Product Team.

**Last Updated:** January 10, 2026
