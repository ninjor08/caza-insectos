import React, { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";

type Bug = {
  id: string;
  x: number; // porcentaje 0-100
  y: number; // porcentaje 0-100
};

export default function HomeScreen() {
  const GAME_SECONDS = 20;

  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [saving, setSaving] = useState(false);

  const [bugs, setBugs] = useState<Bug[]>(() => createBugs(8));

  const title = useMemo(() => "🪲🪲  Caza Insectos  🪲🪲", []);

  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameOver]);

  // Cuando termina el juego: guarda puntaje una vez
  useEffect(() => {
    if (!gameOver) return;

    (async () => {
      try {
        setSaving(true);
        await addDoc(collection(db, "puntajes"), {
          score,
          createdAt: serverTimestamp(),
        });
        
      } catch (e) {
        console.log("Error guardando puntaje:", e);
        Alert.alert("Error", "No se pudo guardar el puntaje en Firebase");
      } finally {
        setSaving(false);
      }
    })();
  }, [gameOver, score]);

  const onHitBug = (id: string) => {
    if (gameOver) return;

    setBugs((prev) => prev.filter((b) => b.id !== id));
    setScore((s) => s + 10);

    // Reponer un insecto nuevo para que siga el juego
    setBugs((prev) => [...prev, createOneBug()]);
  };

  const resetGame = () => {
    setTimeLeft(GAME_SECONDS);
    setScore(0);
    setGameOver(false);
    setSaving(false);
    setBugs(createBugs(8));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {!gameOver ? (
        <>
          <View style={styles.infoRow}>
            <Text style={styles.info}>⏱ Tiempo: {timeLeft}s</Text>
            <Text style={styles.info}>⭐ Puntaje: {score}</Text>
          </View>

          <View style={styles.gameArea}>
            {bugs.map((bug) => (
              <TouchableOpacity
                key={bug.id}
                onPress={() => onHitBug(bug.id)}
                style={[
                  styles.bug,
                  {
                    left: `${bug.x}%`,
                    top: `${bug.y}%`,
                  },
                ]}
              >
                <Text style={styles.bugText}>🐞</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.hint}>Toca los insectos para sumar puntos</Text>
        </>
      ) : (
        <>
          <Text style={styles.gameOver}>Juego terminado</Text>
          <Text style={styles.finalScore}>Puntaje final: {score}</Text>

          <Text style={styles.saving}>
            {saving ? "Guardando puntaje en Firebase..." : "Puntaje guardado en Firebase"}
          </Text>

          <TouchableOpacity style={styles.button} onPress={resetGame}>
            <Text style={styles.buttonText}>Jugar de nuevo</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

function createBugs(n: number): Bug[] {
  return Array.from({ length: n }).map(() => createOneBug());
}

function createOneBug(): Bug {
  
  const x = rand(5, 85);
  const y = rand(5, 75);

  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    x,
    y,
  };
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "800", textAlign: "center", marginTop: 10 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    paddingHorizontal: 8,
  },
  info: { fontSize: 16, fontWeight: "700" },
  gameArea: {
    flex: 1,
    marginTop: 14,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 16,
    position: "relative",
    overflow: "hidden",
  },
  bug: {
    position: "absolute",
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
  },
  bugText: { fontSize: 28 },
  hint: { textAlign: "center", marginBottom: 12, color: "#444" },
  gameOver: { textAlign: "center", marginTop: 30, fontSize: 22, color: "red", fontWeight: "800" },
  finalScore: { textAlign: "center", marginTop: 10, fontSize: 18, fontWeight: "700" },
  saving: { textAlign: "center", marginTop: 10, color: "#333" },
  button: {
    marginTop: 18,
    backgroundColor: "#111",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    alignSelf: "center",
    width: 180,
  },
  buttonText: { color: "#fff", fontWeight: "800" },
});

