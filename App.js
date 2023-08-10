import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
  Alert,
  Platform,
} from "react-native";
import { theme } from "./colors";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const STORAGE_KEY = "@toDos";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadToDos();
  }, []);

  useEffect(() => {
    toDos["isWorkNow"] = working;
    saveToDos(toDos);
  }, [working]);

  const travel = () => {
    setWorking(false);
  };
  const work = () => {
    setWorking(true);
  };
  const onChangeText = (payload) => setText(payload);
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };
  const loadToDos = async () => {
    const loadedToDos = JSON.parse(await AsyncStorage.getItem(STORAGE_KEY));
    if (loadedToDos) {
      setToDos(loadedToDos);
    }
    loadedToDos && loadedToDos.isWorkNow ? work() : travel();
  };
  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working: working, completed: false },
    };
    newToDos["isWorkNow"] = working;
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const deleteToDo = async (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("Do you want to delete this To Do?");
      if (ok) {
        const newToDos = { ...toDos };
        delete newToDos[key];
        newToDos.isWorkNow = working;
        setToDos(newToDos);
        await saveToDos(newToDos);
      }
    } else {
      Alert.alert("Delete To Do?", "Are you sure?", [
        { text: "Cancel" },
        {
          text: "I'm Sure",
          style: "destructive",
          onPress: async () => {
            const newToDos = { ...toDos };
            delete newToDos[key];
            newToDos.isWorkNow = working;
            setToDos(newToDos);
            await saveToDos(newToDos);
          },
        },
      ]);
    }
  };
  const completeToDo = (key) => {
    setToDos((prev) => {
      const newTD = { ...prev };
      newTD[key].completed = !newTD[key].completed;
      return newTD;
    });
  };
  const edit = () => {
    setEditing((prev) => !prev);
  };
  const editToDo = (key) => {
    setToDos((prev) => {
      const edited = { ...prev };
      edited[key].text = editText;
      console.log(edited);
      return edited;
    });
    edit();
    setEditText("");
    saveToDos(toDos);
  };
  const onChangeEditText = (payload) => setEditText(payload);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              color: "white",
              fontSize: 38,
              fontWeight: "600",
              color: working ? "white" : theme.gray,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              color: "white",
              fontSize: 38,
              fontWeight: "600",
              color: !working ? "white" : theme.gray,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          style={styles.input}
          placeholder={working ? "Add a To Do" : "Where do you want to go?"}
          keyboardType={"email-address"}
          returnKeyType={"done"}
          onSubmitEditing={addToDo}
          onChangeText={onChangeText}
          value={text}
        />
      </View>
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working && toDos[key].text ? (
            <View style={{ ...styles.toDo }} key={key}>
              {toDos[key].completed ? (
                <Text
                  style={{
                    ...styles.toDoText,
                    textDecorationLine: "line-through",
                    textDecorationStyle: "solid",
                  }}
                >
                  {toDos[key].text}
                </Text>
              ) : //완료 안했을 때에만 수정 가능
              editing ? (
                <TextInput
                  style={styles.editInput}
                  placeholder={"edit"}
                  keyboardType={"email-address"}
                  returnKeyType={"done"}
                  onSubmitEditing={() => editToDo(key)}
                  onChangeText={onChangeEditText}
                  value={editText}
                />
              ) : (
                <Text style={styles.toDoText}>{toDos[key].text}</Text>
              )}
              <TouchableWithoutFeedback onPress={() => edit()}>
                <Text>
                  <MaterialCommunityIcons
                    name="square-edit-outline"
                    size={28}
                    color="white"
                  />
                </Text>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={() => completeToDo(key)}>
                {toDos[key].completed ? (
                  <Text>
                    <MaterialCommunityIcons
                      name="checkbox-outline"
                      size={28}
                      color="white"
                    />
                  </Text>
                ) : (
                  <Text>
                    <MaterialCommunityIcons
                      name="checkbox-blank-outline"
                      size={28}
                      color="white"
                    />
                  </Text>
                )}
              </TouchableWithoutFeedback>
              <TouchableOpacity onPress={() => deleteToDo(key)}>
                <Text>
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={28}
                    color="white"
                  />
                </Text>
              </TouchableOpacity>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 25,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 100,
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  editInput: {
    flex: 3,
    fontSize: 16,
    borderRadius: 1,
    backgroundColor: "white",
    marginRight: 10,
    paddingVertical: 2,
    paddingHorizontal: 20,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    flex: 3,
  },
});
