"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function Home() {
  const [snags, setSnags] = useState([]);
   const [loading, setLoading] = useState(false);
   const [currentRole, setCurrentRole] = useState(null); 
   const [employeeName] = useState("Ekipa Wykończeniowa 1"); 

 
    const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
  const [newLocation, setNewLocation] = useState("");
      const [newPriority, setNewPriority] = useState("ŚREDNI");
  const [newAssignedTo, setNewAssignedTo] = useState("Ekipa Wykończeniowa 1");
   const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);


    const backupData = [
     {
      id: "1",
      title: "Pęknięcie tynku na ścianie wschodniej",
      description: "Zauważono mikropęknięcia. Wymaga sprawdzenia wilgotności.",
      status: "DO_ZROBIENIA",
      priority: "ŚREDNI",
      location: "Budynek A, Piętro 2",
      assigned_to: "Ekipa Wykończeniowa 1",
      date_reported: "2026-06-04",
      image_url: null
    }
  ];

  const fetchSnags = async () =>{
    if (!currentRole) return;
    setLoading(true);
    try {
      if (!supabase || typeof supabase.from !== "function") {
        setSnags(backupData);
        return;
      }
      let query = supabase.from("snags").select("*");
      if (currentRole === "pracownik") {
        query = query.eq("assigned_to", employeeName);
      }
      const { data, error } = await query.order("date_reported", { ascending: false });
      if (error) setSnags(backupData);
      else setSnags(data && data.length > 0 ? data : backupData);
    } catch (err) {
      setSnags(backupData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentRole) fetchSnags();
  }, [currentRole]);

  const updateStatus = async (id, newStatus) => {
    setSnags(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    try {
      if (supabase && typeof supabase.from === "function") {
        await supabase.from("snags").update({ status: newStatus }).eq("id", id);
      }
    } catch (e) {
      console.error(e);
    }
  };
  const deleteSnag = async (id) => {
    setSnags(prev => prev.filter(item => item.id !== id));
    try {
      if (supabase && typeof supabase.from === "function") {
        const { error } = await supabase.from("snags").delete().eq("id", id);
        if (error) throw error;
      }
    } catch (e) {
      console.error("Błąd usuwania:", e);
      alert("Nie udało się usunąć usterki z bazy danych.");
      fetchSnags(); 
    }
  };

  const handleCreateSnag = async (e) => {
    e.preventDefault();
    if (!newTitle || !newLocation) {
      alert("Tytuł i Lokalizacja są wymagane!");
      return;
    }

    setUploading(true);
    let uploadedImageUrl = null;

    try {
      if (selectedFile && supabase && supabase.storage) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('snag-images')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('snag-images')
          .getPublicUrl(filePath);
          
        uploadedImageUrl = publicUrl;
      }

      const newSnagObject = {
        title: newTitle,
        description: newDescription,
        location: newLocation,
        priority: newPriority,
        assigned_to: newAssignedTo,
        status: "DO_ZROBIENIA",
        date_reported: new Date().toISOString().split('T')[0],
        image_url: uploadedImageUrl
      };

      if (supabase && typeof supabase.from === "function") {
        const { error } = await supabase.from("snags").insert([newSnagObject]);
        if (error) throw error;
      } else {
        setSnags(prev => [{ ...newSnagObject, id: Math.random().toString() }, ...prev]);
      }

      setNewTitle("");
      setNewDescription("");
      setNewLocation("");
      setSelectedFile(null);
      setShowForm(false);
      fetchSnags();

    } catch (err) {
      console.error(err);
      alert("Błąd dodawania usterki.");
    } finally {
      setUploading(false);
    }
  };

  // login
  if (currentRole === null) {
    return (
      <div style={{ fontFamily: "sans-serif", padding: "50px", textAlign: "center" }}>
        <h1>Witaj w SnagTracker</h1>
        <p>Wybierz profil, aby się zalogować do systemu:</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "15px", maxWidth: "300px", margin: "30px auto" }}>
          <button onClick={() => setCurrentRole("wykonawca")} style={{ padding: "15px", cursor: "pointer" }}>
            Zaloguj jako: Generalny Wykonawca
          </button>
          <button onClick={() => setCurrentRole("pracownik")} style={{ padding: "15px", cursor: "pointer" }}>
            Zaloguj jako: Pracownik ({employeeName})
          </button>
        </div>
      </div>
    );
  }
  //workpanel
  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid black", paddingBottom: "10px" }}>
        <div>
          <h2>SnagTracker</h2>
          <p>Rola: <strong>{currentRole === "wykonawca" ? "Generalny Wykonawca" : "Pracownik"}</strong></p>
        </div>
        <button onClick={() => { setCurrentRole(null); setShowForm(false); }} style={{ padding: "5px 10px", cursor: "pointer" }}>Wyloguj</button>
      </div>

      {currentRole === "wykonawca" && !showForm && (
        <button onClick={() => setShowForm(true)} style={{ margin: "15px 0", padding: "10px", cursor: "pointer", fontWeight: "bold" }}>
          + Zgłoś nową usterkę
        </button>
      )}

      {showForm && (
        <form onSubmit={handleCreateSnag} style={{ border: "2px solid blue", padding: "15px", margin: "15px 0", display: "flex", flexDirection: "column", gap: "10px" }}>
          <h3>Nowe zgłoszenie usterki</h3>
          <label>Tytuł usterki (wymagane):</label>
          <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
          <label>Opis szczegółowy:</label>
          <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
          <label>Lokalizacja na budowie (wymagane):</label>
          <input type="text" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} required />
          <label>Priorytet:</label>
          <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
            <option value="NISKI">NISKI</option>
            <option value="ŚREDNI">ŚREDNI</option>
            <option value="WYSOKI">WYSOKI</option>
            <option value="KRYTYCZNY">KRYTYCZNY</option>
          </select>
          <label>Przypisz do wykonawcy:</label>
          <select value={newAssignedTo} onChange={(e) => setNewAssignedTo(e.target.value)}>
            <option value="Ekipa Wykończeniowa 1">Ekipa Wykończeniowa 1</option>
            <option value="Zespół Montażowy">Zespół Montażowy</option>
            <option value="Ekipa Porządkowa">Ekipa Porządkowa</option>
          </select>
          <label>Zdjęcie usterki:</label>
          <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files[0])} />
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button type="submit" disabled={uploading} style={{ padding: "10px", cursor: "pointer", backgroundColor: "green", color: "white" }}>
              {uploading ? "Wysyłanie..." : "Zapisz w Supabase"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding: "10px", cursor: "pointer" }}>Anuluj</button>
          </div>
        </form>
      )}

    
      {loading ? <p>Ładowanie danych...</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
          {snags.map((snag) => (
            <div key={snag.id} style={{ border: "1px solid gray", padding: "10px" }}>
              <h3>{snag.title}</h3>
              <p>Status: <strong>{snag.status}</strong> | Priorytet: {snag.priority}</p>
              <p>Lokalizacja: {snag.location} | Dla: {snag.assigned_to}</p>
              <p><em>{snag.description}</em></p>
              
              {snag.image_url && (
                <div style={{ margin: "10px 0" }}>
                  <img src={snag.image_url} alt="Zdjęcie" style={{ maxWidth: "100%", maxHeight: "200px", border: "1px dashed black" }} />
                </div>
              )}
              
              <p><small>Data zgłoszenia: {snag.date_reported}</small></p>
              
              {/* manag dep. on role */}
              {currentRole === "pracownik" ? (
                <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px dashed gray" }}>
                  <button 
                    disabled={snag.status === "W_TOKU"} 
                    onClick={() => updateStatus(snag.id, "W_TOKU")} 
                    style={{ cursor: "pointer" }}
                  >
                    Ustaw: W TOKU
                  </button>
                  <button 
                    disabled={snag.status === "ROZWIĄZANE"} 
                    onClick={() => updateStatus(snag.id, "ROZWIĄZANE")} 
                    style={{ marginLeft: "10px", cursor: "pointer" }}
                  >
                    Ustaw: ROZWIĄZANE
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px dashed gray" }}>
                  {/* btn del for manag */}
                  {snag.status === "ROZWIĄZANE" ? (
                    <button 
                      onClick={() => deleteSnag(snag.id)} 
                      style={{ cursor: "pointer", backgroundColor: "orange", fontWeight: "bold", padding: "5px 10px" }}
                    >
                      ✅ Zatwierdź naprawę (Zamknij i Usuń)
                    </button>
                  ) : (
                    <div style={{ color: "#666", fontSize: "13px" }}>
                      ℹ️ <em>Oczekiwanie aż pracownik oznaczy zadanie jako ROZWIĄZANE.</em>
                    </div>
                  )}
                </div>
              )}

            </div>
          ))}
          {snags.length === 0 && <p style={{ textAlign: "center", border: "1px dashed black", padding: "10px" }}>Wszystkie usterki zostały naprawione i odebrane!</p>}
        </div>
      )}
    </div>
  );
}