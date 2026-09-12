
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase/client';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Heart, CheckCircle, XCircle, ArrowRight } from 'lucide-react-native';

type QuizScreenRouteProp = RouteProp<RootStackParamList, 'Quiz'>;

export const QuizScreen = () => {
    const route = useRoute<QuizScreenRouteProp>();
    const navigation = useNavigation();
    const { islandId } = route.params;

    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [lives, setLives] = useState(3);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [correctCount, setCorrectCount] = useState(0);

    useEffect(() => {
        const fetchQuestions = async () => {
            // Join questions with topics to filter by island_id
            const { data, error } = await supabase
                .from('questions')
                .select('*, topics!inner(*)')
                .eq('topics.island_id', islandId)
                .eq('status', 'PUBLISHED')
                .limit(20); // Limit for now

            if (error) {
                console.error(error);
                Alert.alert("Error", "No se pudieron cargar las preguntas.");
                navigation.goBack();
            } else {
                setQuestions(data || []);
            }
            setLoading(false);
        };

        fetchQuestions();
    }, [islandId]);

    const handleAnswer = async (option: any) => {
        if (isAnswered) return;
        
        setSelectedOption(option.text);
        setIsAnswered(true);

        const isCorrect = option.is_correct;
        
        // Persist Progress
        const { error } = await supabase.from('user_progress').upsert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            question_id: questions[currentIndex].id,
            successes: isCorrect ? 1 : 0, // Simplified increment logic would require fetching first
            attempts: 1,
            last_attempt: new Date().toISOString()
        }, { onConflict: 'user_id,question_id' }); // This is a rough MVP upsert

        if (isCorrect) {
            setFeedback("¡Correcto!");
            setCorrectCount(prev => prev + 1);
        } else {
            setFeedback("Incorrecto");
            if (questions[currentIndex].is_critical) {
                setLives(prev => prev - 1);
            }
        }
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
            setFeedback(null);
        } else {
            // Calculate final score
            const finalScore = Math.round((correctCount / questions.length) * 100);
            navigation.navigate('Results' as never, { 
                score: finalScore,
                totalQuestions: questions.length,
                correctCount
            } as never);
        }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#1A237E" /></View>;
    if (questions.length === 0) return <View style={styles.center}><Text>No hay preguntas en esta isla aún.</Text></View>;
    if (lives <= 0) {
        return (
            <View style={styles.center}>
                <XCircle size={64} color="red" />
                <Text style={[styles.title, { marginTop: 20 }]}>Has perdido tus vidas</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.button}>
                    <Text style={styles.buttonText}>Regresar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const currentQ = questions[currentIndex];
    const options = currentQ.content.options || [];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Header Stats */}
            <View style={styles.header}>
                <Text style={styles.progress}>Pregunta {currentIndex + 1}/{questions.length}</Text>
                <View style={styles.lives}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Heart key={i} size={24} color={i < lives ? "red" : "#ccc"} fill={i < lives ? "red" : "none"} />
                    ))}
                </View>
            </View>

            {/* Question Card */}
            <View style={styles.card}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{currentQ.is_critical ? 'CRÍTICA' : 'CASO CLÍNICO'}</Text>
                </View>
                
                <Text style={styles.stem}>{currentQ.content.stem}</Text>

                {/* Findings */}
                {currentQ.content.findings && currentQ.content.findings.length > 0 && (
                    <View style={styles.findingsBox}>
                        <Text style={styles.sectionTitle}>Hallazgos:</Text>
                        {currentQ.content.findings.map((f: any, i: number) => (
                            <Text key={i} style={styles.findingItem}>• {f.label}: {f.value}</Text>
                        ))}
                    </View>
                )}
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
                {options.map((opt: any, index: number) => {
                    let cardStyle = styles.optionCard;
                    if (isAnswered) {
                        if (opt.is_correct) cardStyle = styles.optionCorrect;
                        else if (selectedOption === opt.text) cardStyle = styles.optionWrong;
                    }

                    return (
                        <TouchableOpacity 
                            key={index} 
                            style={cardStyle}
                            onPress={() => handleAnswer(opt)}
                            disabled={isAnswered}
                        >
                            <Text style={styles.optionText}>{opt.text}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Feedback & Next */}
            {isAnswered && (
                <View style={styles.feedbackContainer}>
                    <View style={styles.pearlBox}>
                        <Text style={styles.pearlTitle}>💡 Perla del Consejo:</Text>
                        <Text style={styles.pearlText}>{currentQ.pearl}</Text>
                        <Text style={styles.refText}>Ref: {currentQ.source_reference}</Text>
                    </View>
                    <TouchableOpacity style={styles.nextButton} onPress={nextQuestion}>
                        <Text style={styles.nextButtonText}>Siguiente</Text>
                        <ArrowRight color="white" size={20} />
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16, backgroundColor: '#F5F5F5', paddingBottom: 50 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    progress: { fontSize: 16, fontWeight: 'bold', color: '#666' },
    lives: { flexDirection: 'row', gap: 4 },
    title: { fontSize: 24, fontWeight: 'bold' },
    card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
    badge: { alignSelf: 'flex-start', backgroundColor: '#E8EAF6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: 8 },
    badgeText: { color: '#1A237E', fontSize: 12, fontWeight: 'bold' },
    stem: { fontSize: 16, color: '#333', lineHeight: 24, marginBottom: 12 },
    findingsBox: { backgroundColor: '#FFF3E0', padding: 12, borderRadius: 8 },
    sectionTitle: { fontWeight: 'bold', marginBottom: 4, color: '#E65100' },
    findingItem: { fontSize: 14, color: '#BF360C' },
    optionsContainer: { gap: 10 },
    optionCard: { backgroundColor: 'white', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
    optionCorrect: { backgroundColor: '#E8F5E9', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#4CAF50' },
    optionWrong: { backgroundColor: '#FFEBEE', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#F44336' },
    optionText: { fontSize: 16 },
    feedbackContainer: { marginTop: 20 },
    pearlBox: { backgroundColor: '#E3F2FD', padding: 16, borderRadius: 8, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#2196F3' },
    pearlTitle: { fontWeight: 'bold', color: '#1565C0', marginBottom: 4 },
    pearlText: { color: '#0D47A1' },
    refText: { fontSize: 12, color: '#546E7A', marginTop: 8, fontStyle: 'italic' },
    nextButton: { backgroundColor: '#1A237E', padding: 16, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    nextButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginRight: 8 },
    button: { backgroundColor: '#1A237E', padding: 12, borderRadius: 8, marginTop: 10 },
    buttonText: { color: 'white' }
});
