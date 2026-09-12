import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { CheckCircle, Award, Home } from 'lucide-react-native';

type ResultsScreenRouteProp = RouteProp<RootStackParamList, 'Results'>;

export const ResultsScreen = () => {
    const route = useRoute<ResultsScreenRouteProp>();
    const navigation = useNavigation<any>(); // Simplified typing for reset/navigate
    const { score, totalQuestions, correctCount } = route.params;

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={[styles.iconContainer, score >= 60 ? styles.successIcon : styles.failIcon]}>
                    <Award size={64} color="white" />
                </View>
                
                <Text style={styles.scoreTitle}>
                    {score >= 60 ? '¡Excelente Trabajo!' : 'Sigue Practicando'}
                </Text>
                
                <View style={styles.scoreContainer}>
                    <Text style={styles.scoreText}>{score}%</Text>
                    <Text style={styles.scoreLabel}>Puntaje Final</Text>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{correctCount}</Text>
                        <Text style={styles.statLabel}>Correctas</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{totalQuestions}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity 
                style={styles.button}
                onPress={() => navigation.reset({
                    index: 0,
                    routes: [{ name: 'Islands' }],
                })}
            >
                <Home color="white" size={24} style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Volver al Inicio</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        padding: 24,
        justifyContent: 'center',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        marginBottom: 32,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        elevation: 4,
    },
    successIcon: {
        backgroundColor: '#4CAF50',
    },
    failIcon: {
        backgroundColor: '#FF9800',
    },
    scoreTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 24,
        textAlign: 'center',
    },
    scoreContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    scoreText: {
        fontSize: 64,
        fontWeight: 'bold',
        color: '#1A237E',
    },
    scoreLabel: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingTop: 24,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: '#EEE',
    },
    button: {
        backgroundColor: '#1A237E',
        padding: 20,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    buttonIcon: {
        marginRight: 12,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
