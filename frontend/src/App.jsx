import { useEffect, useState } from "react";

function App() {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  const [showCart, setShowCart] = useState(false);
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    category: "",
    brands: [],
    colors: [],
  });

  const [user, setUser] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [wishlist, setWishlist] = useState(
  JSON.parse(localStorage.getItem("wishlist")) || []
  );
  const [reviews, setReviews] = useState({});
  const [showSummary, setShowSummary] = useState(false);

  const user_id = user?.id;

  // ---------------- FETCH ----------------
  const fetchProducts = async () => {
    const res = await fetch("http://localhost:8000/products/");
    const data = await res.json();

    const clean = data.map(p => ({
      ...p,
      brand: p.brand || "unknown",
      color: p.color || "unknown",
      category: p.category || "mobile"
    }));

    setProducts(clean);
    setAllProducts(clean);
  };

  const fetchCart = async () => {
    if (!user_id) return;
    const res = await fetch(`http://localhost:8000/cart/${user_id}`);
    const data = await res.json();
    setCartItems(data);
  };

  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => { fetchCart(); }, [user]);

  // ---------------- FILTER ----------------
  useEffect(() => {
    let filtered = [...allProducts];

    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    if (filters.brands.length > 0) {
      filtered = filtered.filter(p => filters.brands.includes(p.brand));
    }

    if (filters.colors.length > 0) {
      filtered = filtered.filter(p => filters.colors.includes(p.color));
    }

    if (search) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setProducts(filtered);
  }, [filters, search, allProducts]);

  const handleCheckbox = (type, value) => {
    setFilters(prev => {
      const list = prev[type];
      return list.includes(value)
        ? { ...prev, [type]: list.filter(v => v !== value) }
        : { ...prev, [type]: [...list, value] };
    });
  };

  const resetFilters = () => {
    setFilters({ category: "", brands: [], colors: [] });
    setSearch("");
  };

  const uniqueBrands = [...new Set(allProducts.map(p => p.brand))];
  const uniqueColors = [...new Set(allProducts.map(p => p.color))];

  // ---------------- AUTH ----------------
  const register = async () => {
    await fetch("http://localhost:8000/users/register", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ name, email, password }),
    });
    alert("Registered ✅");
    setIsRegister(false);
  };

  const login = async () => {
    const res = await fetch("http://localhost:8000/users/login", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (data.user) setUser(data.user);
    else alert("Login failed");
  };

  const logout = () => {
    setUser(null);
    setCartItems([]);
  };

  // ---------------- CART ----------------
  const addToCart = async (productId) => {
    if (!user) return alert("Login first");

    await fetch("http://127.0.0.1:8000/cart/add", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        user_id: user.id,
        product_id: productId,
        quantity: 1
      })
    });

    fetchCart();
  };

  const removeItem = async (id) => {
    await fetch(`http://localhost:8000/cart/${id}`, { method: "DELETE" });
    fetchCart();
  };
  // ❤️ Wishlist
  const toggleWishlist = (product) => {
  let updated;
  if (wishlist.find(p => p.id === product.id)) {
    updated = wishlist.filter(p => p.id !== product.id);
  } else {
    updated = [...wishlist, product];
  }
  setWishlist(updated);
  localStorage.setItem("wishlist", JSON.stringify(updated));
  };

// ⭐ Reviews
const addReview = (productId, text) => {
  const newReviews = {
    ...reviews,
    [productId]: [...(reviews[productId] || []), text]
  };
  setReviews(newReviews);
};

  // ---------------- CHECKOUT ----------------
  const handleCheckout = async () => {
  try {
    console.log("🔥 Checkout clicked");

    if (!user) return alert("Login first");
    if (!address || !pincode) return alert("Enter address");

    const res = await fetch(`http://127.0.0.1:8000/orders/create-payment/${user.id}`, {
      method: "POST"
    });

    console.log("STATUS:", res.status);

    const text = await res.text();
    console.log("RAW RESPONSE:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      alert("Backend not returning JSON");
      return;
    }

    console.log("Parsed data:", data);

    if (!data.order_id) {
      alert("Order ID missing");
      return;
    }

    if (!window.Razorpay) {
      alert("Razorpay not loaded");
      return;
    }

    const options = {
      key: "rzp_test_SblFaP6yiTzSNo",
      amount: data.amount,
      currency: "INR",
      name: "MyShop",
      order_id: data.order_id,
      handler: function () {
        alert("Payment Success");
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (err) {
    console.error("🔥 ERROR:", err);
    alert("Something broke");
  }
};
  if (selectedProduct) {
  return (
    <div className="p-6">
      <button onClick={()=>setSelectedProduct(null)}>← Back</button>

      <div className="bg-white p-6 mt-4">
        <img src={selectedProduct.image} className="h-60"/>

        <h2>{selectedProduct.name}</h2>
        <p>₹{selectedProduct.price}</p>
        <p>{selectedProduct.description}</p>

        <button onClick={()=>addToCart(selectedProduct.id)}>
          Add to Cart
        </button>

        <h3 className="mt-4">Reviews</h3>
        {(reviews[selectedProduct.id] || []).map((r,i)=>(
          <p key={i}>⭐ {r}</p>
        ))}

        <input
          placeholder="Write review..."
          onKeyDown={(e)=>{
            if(e.key==="Enter"){
              addReview(selectedProduct.id, e.target.value);
              e.target.value="";
            }
          }}
        />
      </div>
    </div>
  );
}  
  // ---------------- UI ----------------
  return (
    <div className="bg-[#EAEDED] min-h-screen">

    {/* 🔥 AMAZON NAVBAR */}
    <div className="bg-[#131921] text-white flex items-center px-6 py-3 gap-6 sticky top-0 z-50 shadow">

      <h1 className="text-2xl font-bold cursor-pointer">🛒 MyShop</h1>

      <input
        placeholder="Search Amazon-like products..."
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
        className="flex-1 px-4 py-2 rounded text-black focus:outline-none"
      />

      {user ? (
        <>
          <span className="text-sm">Hello, {user.name}</span>
          <button onClick={logout} className="hover:underline">Logout</button>
        </>
      ) : (
        <div className="flex gap-2 items-center flex-wrap">
          {isRegister && (
            <input placeholder="Name" onChange={e=>setName(e.target.value)} className="px-2 py-1 text-black rounded"/>
          )}
          <input placeholder="Email" onChange={e=>setEmail(e.target.value)} className="px-2 py-1 text-black rounded"/>
          <input type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)} className="px-2 py-1 text-black rounded"/>

          {isRegister ? (
            <button onClick={register} className="bg-yellow-400 px-3 py-1 rounded text-black">Register</button>
          ) : (
            <button onClick={login} className="bg-yellow-400 px-3 py-1 rounded text-black">Login</button>
          )}

          <button onClick={()=>setIsRegister(!isRegister)} className="text-sm underline">
            {isRegister ? "Login" : "Register"}
          </button>
        </div>
      )}

      <button
        onClick={()=>setShowCart(true)}
        className="bg-yellow-400 text-black px-3 py-1 rounded font-semibold"
      >
        Cart ({cartItems.length})
      </button>
    </div>

    {/* 🔥 MAIN */}
    <div className="flex p-6 gap-6">

      {/* 🔥 SIDEBAR */}
      <div className="w-64 bg-white p-4 rounded shadow sticky top-24 h-fit">
        <h3 className="font-bold text-lg mb-2">Filters</h3>

        <button onClick={resetFilters} className="text-blue-600 mb-3 text-sm">
          Reset
        </button>

        <p className="font-semibold">Category</p>
        <label className="block text-sm">
          <input
            type="radio"
            checked={filters.category==="mobile"}
            onChange={()=>setFilters(p=>({...p,category:"mobile"}))}
          /> Mobile
        </label>

        <p className="font-semibold mt-3">Brand</p>
        {uniqueBrands.map(b=>(
          <label key={b} className="block text-sm">
            <input
              type="checkbox"
              checked={filters.brands.includes(b)}
              onChange={()=>handleCheckbox("brands",b)}
            /> {b}
          </label>
        ))}

        <p className="font-semibold mt-3">Color</p>
        {uniqueColors.map(c=>(
          <label key={c} className="block text-sm">
            <input
              type="checkbox"
              checked={filters.colors.includes(c)}
              onChange={()=>handleCheckbox("colors",c)}
            /> {c}
          </label>
        ))}
      </div>

      {/* 🔥 PRODUCTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 flex-1">
        {products.map(p=>(
          <div
            key={p.id}
            className="bg-white p-4 rounded shadow hover:shadow-xl transition duration-300 flex flex-col"
          >
            <img
              src={p.image}
              className="h-44 object-contain cursor-pointer"
              onClick={() => setSelectedProduct(p)}
            />

            <button
              onClick={()=>toggleWishlist(p)}
              className="text-right text-xl"
            >
              {wishlist.find(w=>w.id===p.id) ? "❤️" : "🤍"}
            </button>

            <h3 className="font-semibold mt-2 text-sm">{p.name}</h3>

            <p className="text-green-600 font-bold text-lg">₹{p.price}</p>

            <button
              onClick={()=>addToCart(p.id)}
              className="mt-auto bg-yellow-400 hover:bg-yellow-500 text-black py-2 rounded font-semibold"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* 🔥 ORDER SUMMARY */}
      {showSummary && (
        <div className="fixed right-0 top-0 w-96 bg-white p-5 h-full shadow-xl">
          <h2 className="font-bold text-xl mb-3">Order Summary</h2>

          <p className="mb-3">
            Total: ₹{cartItems.reduce((sum, item) =>
              sum + item.product.price * item.quantity, 0)}
          </p>

          <input
            placeholder="Address"
            onChange={(e)=>setAddress(e.target.value)}
            className="border p-2 w-full mb-2"
          />

          <input
            placeholder="Pincode"
            onChange={(e)=>setPincode(e.target.value)}
            className="border p-2 w-full mb-2"
          />

          <button
  type="button"
  onClick={handleCheckout}
  className="bg-green-600 text-white w-full p-2 rounded"
>
  Checkout
</button>

          <button
  onClick={()=>{
  setShowSummary(false);   // ✅ CLOSE summary
}}
  
  className="bg-green-600 text-white w-full mt-3 p-2 rounded"
>
  Checkout
</button>
        </div>
      )}
    </div>

    {/* 🔥 CART DRAWER */}
    {showCart && (
      <div className="fixed right-0 top-0 w-96 h-full bg-white shadow-xl p-5">
        <h2 className="text-xl font-bold mb-3">Cart</h2>

        {cartItems.map(item=>(
          <div key={item.id} className="border-b py-2 flex justify-between">
            <span>{item.product.name}</span>
            <button
              onClick={()=>removeItem(item.id)}
              className="text-red-500 text-sm"
            >
              Remove
            </button>
          </div>
        ))}

        <input placeholder="Address" onChange={e=>setAddress(e.target.value)} className="border p-2 w-full mt-3"/>
        <input placeholder="Pincode" onChange={e=>setPincode(e.target.value)} className="border p-2 w-full mt-2"/>

        <button
          onClick={()=>setShowSummary(true)}
          className="bg-green-600 text-white w-full mt-3 p-2 rounded"
        >
          Checkout
        </button>

        <button onClick={()=>setShowCart(false)} className="mt-2 w-full text-sm">
          Close
        </button>
      </div>
    )}
  </div>
);
}

export default App;