import axios from 'axios';

const API_URL = process.env.API_URL || 'https://api.babydiary.com';

export const fetchBabies = async () => {
    try {
        const response = await axios.get(`${API_URL}/babies`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching babies: ' + error.message);
    }
};

export const addBaby = async (babyData) => {
    try {
        const response = await axios.post(`${API_URL}/babies`, babyData);
        return response.data;
    } catch (error) {
        throw new Error('Error adding baby: ' + error.message);
    }
};

export const updateBaby = async (babyId, babyData) => {
    try {
        const response = await axios.put(`${API_URL}/babies/${babyId}`, babyData);
        return response.data;
    } catch (error) {
        throw new Error('Error updating baby: ' + error.message);
    }
};

export const deleteBaby = async (babyId) => {
    try {
        await axios.delete(`${API_URL}/babies/${babyId}`);
    } catch (error) {
        throw new Error('Error deleting baby: ' + error.message);
    }
};