import { useEffect, useState } from "react";

function App() {
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [view, setView] = useState("shop"); 
  
  // --- FILTER STATES ---
  const [category, setCategory] = useState("All");
  const [priceRange, setPriceRange] = useState(150000); // Default to max
  const [search, setSearch] = useState("");

  const [user, setUser] = useState({ id: 1, name: "sathish", email: "test@me.com" });
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [orderStatus, setOrderStatus] = useState(null);

  const API_BASE = "http://localhost:8000";

  // --- 1. DATA FETCHING ---
  const fetchData = async () => {
    try {
      const pRes = await fetch(`${API_BASE}/products/`);
      const pData = await pRes.json();
      setAllProducts(pData || []);
      setProducts(pData || []);

      if (user) {
        const cRes = await fetch(`${API_BASE}/cart/${user.id}`);
        const cData = await cRes.json();
        setCartItems(cData || []);
      }
    } catch (err) { console.error("Backend offline"); }
  };

  useEffect(() => { fetchData(); }, [user]);

  // --- 2. FILTER LOGIC ---
  useEffect(() => {
    let filtered = allProducts;
    if (category !== "All") {
      filtered = filtered.filter(p => p.category === category);
    }
    filtered = filtered.filter(p => p.price <= priceRange);
    if (search) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    setProducts(filtered);
  }, [category, priceRange, search, allProducts]);

  // --- NEW: CLEAR FILTERS FUNCTION ---
  const clearFilters = () => {
    setCategory("All");
    setPriceRange(150000);
    setSearch("");
  };

  // --- 3. CART CALCULATIONS ---
  const cartWithDetails = cartItems.map(item => {
    const product = allProducts.find(p => p.id === item.product_id || p._id === item.product_id);
    return { ...item, details: product };
  });
  const subtotal = cartWithDetails.reduce((sum, item) => sum + (item.details?.price || 0), 0);
  const total = subtotal + (subtotal * 0.18);

  const handleCheckout = async () => {
    if (!window.Razorpay) return alert("Razorpay script missing!");
    const options = {
      key: "rzp_test_YOUR_KEY",
      amount: Math.round(total * 100),
      currency: "INR",
      name: "MyShop",
      handler: function (response) {
        const orderInfo = { id: "ORD-"+Date.now(), tracking: "TRK-"+Math.random().toString(36).substr(2, 9) };
        setMyOrders([orderInfo, ...myOrders]);
        setOrderStatus(orderInfo);
        setCartItems([]);
      }
    };
    new window.Razorpay(options).open();
  };

  return (
    <div className="bg-[#EAEDED] min-h-screen">
      {/* NAVBAR */}
      <nav className="bg-[#131921] text-white p-3 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-xl font-bold px-4 cursor-pointer" onClick={() => setView("shop")}>MyShop</h1>
        <input 
          placeholder="Search products..." 
          className="flex-1 max-w-xl mx-4 p-2 rounded text-black outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-6 px-4 items-center">
          <button onClick={() => setView("shop")} className={view === "shop" ? "text-yellow-400" : ""}>Home</button>
          <button onClick={() => setView("orders")} className={view === "orders" ? "text-yellow-400" : ""}>My Orders</button>
          <button onClick={() => setView("cart")} className="relative font-bold">
            Cart <span className="bg-orange-500 rounded-full px-2 text-xs ml-1">{cartItems.length}</span>
          </button>
          <button onClick={() => setUser(null)} className="text-sm">Logout</button>
        </div>
      </nav>

      <div className="flex">
        {/* --- SIDEBAR FILTERS --- */}
        {view === "shop" && (
          <aside className="w-64 bg-white min-h-screen p-6 shadow-sm hidden md:block">
            <h3 className="font-bold text-lg mb-4">Filters</h3>
            
            <div className="mb-6">
              <p className="font-semibold mb-2">Category</p>
              {["All", "Mobile", "Laptop", "Watch"].map(cat => (
                <label key={cat} className="flex items-center gap-2 mb-1 cursor-pointer hover:text-orange-600">
                  <input type="radio" name="cat" checked={category === cat} onChange={() => setCategory(cat)} />
                  {cat}
                </label>
              ))}
            </div>

            <div className="mb-6">
              <p className="font-semibold mb-2">Max Price: ₹{priceRange}</p>
              <input 
                type="range" min="10000" max="150000" step="5000" 
                value={priceRange} onChange={(e) => setPriceRange(e.target.value)}
                className="w-full cursor-pointer accent-orange-500"
              />
            </div>

            {/* CLEAR FILTERS BUTTON */}
            <button 
              onClick={clearFilters}
              className="w-full py-2 border border-gray-300 rounded text-sm font-semibold hover:bg-gray-50 transition"
            >
              Clear All Filters
            </button>
          </aside>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1">
          {view === "shop" && (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-white p-4 rounded shadow-sm hover:shadow-md transition border border-gray-100">
                  <img src={p.image} className="h-44 w-full object-contain mb-4" alt="" />
                  <h3 className="font-bold truncate text-sm">{p.name}</h3>
                  <p className="text-green-700 font-bold text-lg">₹{p.price}</p>
                  <button className="bg-yellow-400 w-full mt-3 py-1 rounded font-semibold text-sm">Add to Cart</button>
                </div>
              ))}
            </div>
          )}

          {/* VIEW: CART */}
          {view === "cart" && (
            <div className="max-w-5xl mx-auto p-8 flex flex-col lg:flex-row gap-8">
              <div className="flex-1 bg-white p-6 rounded shadow-sm">
                <h2 className="text-2xl font-bold border-b pb-4 mb-4">Your Cart</h2>
                {cartWithDetails.length === 0 ? <p className="text-gray-400">Cart is empty</p> : cartWithDetails.map(item => (
                  <div key={item.id} className="flex gap-6 border-b py-4 items-center">
                    <img src={item.details?.image} className="h-20 w-20 object-contain" alt="" />
                    <div className="flex-1">
                      <p className="font-bold">{item.details?.name || "Loading..."}</p>
                      <p className="text-green-600 font-bold">₹{item.details?.price || 0}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="w-96 bg-white p-6 rounded shadow-sm h-fit">
                <h3 className="font-bold text-lg mb-4">Payment Summary</h3>
                <div className="flex justify-between mb-2"><span>Subtotal:</span><span>₹{subtotal}</span></div>
                <div className="flex justify-between font-bold text-xl text-red-700 border-t pt-2 mb-6">
                  <span>Total (GST 18%):</span><span>₹{total.toFixed(2)}</span>
                </div>
                <input placeholder="Address" className="w-full border p-2 mb-2 rounded" onChange={e => setAddress(e.target.value)} />
                <input placeholder="Pincode" className="w-full border p-2 mb-4 rounded" onChange={e => setPincode(e.target.value)} />
                <button onClick={handleCheckout} className="w-full bg-[#FF9900] py-3 rounded-lg font-bold shadow hover:bg-orange-500">
                  Checkout & Pay
                </button>
              </div>
            </div>
          )}

          {/* VIEW: ORDERS */}
          {view === "orders" && (
            <div className="max-w-4xl mx-auto p-10">
              <h2 className="text-2xl font-bold mb-6 text-center">My Order Tracking</h2>
              {myOrders.length === 0 ? <p className="text-center bg-white p-10 rounded shadow">No orders found.</p> : myOrders.map(o => (
                <div key={o.id} className="bg-white p-6 rounded shadow-sm mb-4 border-l-4 border-green-500">
                  <div className="flex justify-between font-bold">
                    <span>Order ID: {o.id}</span>
                    <span className="text-green-600">Paid</span>
                  </div>
                  <p className="text-blue-600 text-sm mt-2">Tracking ID: <b>{o.tracking}</b></p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* SUCCESS POPUP */}
      {orderStatus && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-10 rounded-2xl text-center max-w-sm">
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
            <p className="text-gray-500 mb-6 font-mono text-sm">Tracking: {orderStatus.tracking}</p>
            <button onClick={() => {setOrderStatus(null); setView("orders");}} className="bg-gray-800 text-white w-full py-2 rounded">Track My Order</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
