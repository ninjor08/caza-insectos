import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { db } from "../../firebaseConfig";

export default function HighScoreScreen() {
  const [best, setBest] = useState<number | null>(null);

  useEffect(() => {
    const loadBest = async () => {
      try {
        const q = query(collection(db, "scores"), orderBy("score", "desc"), limit(1));
        const snap = await getDocs(q);

        if (!snap.empty) {
          setBest(snap.docs[0].data().score);
        } else {
          setBest(0);
        }
      } catch (e) {
        setBest(0);
      }
    };

    loadBest();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Puntaje más alto</Text>
      <Text style={styles.score}>{best === null ? "Cargando..." : best}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 15 },
  score: { fontSize: 40, fontWeight: "bold" },
});

