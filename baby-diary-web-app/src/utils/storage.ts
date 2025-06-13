import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@baby_diary_storage';

export const saveData = async (data: any) => {
    try {
        const jsonData = JSON.stringify(data);
        await AsyncStorage.setItem(STORAGE_KEY, jsonData);
    } catch (e) {
        console.error('Error saving data', e);
    }
};

export const getData = async () => {
    try {
        const jsonData = await AsyncStorage.getItem(STORAGE_KEY);
        return jsonData != null ? JSON.parse(jsonData) : null;
    } catch (e) {
        console.error('Error retrieving data', e);
    }
};

export const clearData = async () => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.error('Error clearing data', e);
    }
};