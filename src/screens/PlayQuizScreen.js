import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import {COLORS} from '../constants/theme';
import {getQuestionsByQuizId, getQuizById} from '../utils/database';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FormButton from '../components/shared/FormButton';
import ResultModal from '../components/playQuizScreen/ResultModal';

const PlayQuizScreen = ({navigation, route}) => {
  const [currentQuizId, setCurrentQuizId] = useState(route.params.quizId);
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([]);

  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [ansSelected, setAnsSelected] = useState(false);
  const [oneTimeUse, setOneTimeUse50] = useState(false);

  const [isResultModalVisible, setIsResultModalVisible] = useState(false);

  const shuffleArray = array => {
    for (let i = array.length - 1; i > 0; i--) {
      // Generate random number
      let j = Math.floor(Math.random() * (i + 1));

      let temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  };

  const getQuizAndQuestionDetails = async () => {
    // Get Quiz
    let currentQuiz = await getQuizById(currentQuizId);
    currentQuiz = currentQuiz.data();
    setTitle(currentQuiz.title);

    // Get Questions for current quiz
    const questions = await getQuestionsByQuizId(currentQuizId);

    // Transform and shuffle options
    let tempQuestions = [];
    await questions.docs.forEach(async res => {
      let question = res.data();

      console.log({question});
      // Create Single array of all options and shuffle it
      question.allOptions = shuffleArray([
        ...question.incorrect_answers,
        question.correct_answer,
      ]);
      await tempQuestions.push(question);
    });

    console.log(JSON.stringify(tempQuestions));
    setQuestions([...tempQuestions]);
  };

  useEffect(() => {
    getQuizAndQuestionDetails();
  }, []);

  const getOptionBgColor = (currentQuestion, currentOption) => {
    if (currentQuestion.selectedOption) {
      if (currentOption == currentQuestion.selectedOption) {
        if (currentOption == currentQuestion.correct_answer) {
          return COLORS.success;
        } else {
          return COLORS.error;
        }
      } else {
        return COLORS.white;
      }
    } else {
      return COLORS.white;
    }
  };

  const getOptionTextColor = (currentQuestion, currentOption) => {
    if (currentQuestion.selectedOption) {
      if (currentOption == currentQuestion.selectedOption) {
        return COLORS.white;
      } else {
        return COLORS.black;
      }
    } else {
      return COLORS.black;
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        position: 'relative',
      }}>
      <StatusBar backgroundColor={COLORS.white} barStyle={'dark-content'} />
      {/* Top Bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 10,
          paddingHorizontal: 20,
          backgroundColor: COLORS.white,
          elevation: 4,
        }}>
        {/* Back Icon */}
        <MaterialIcons
          name="arrow-back"
          size={24}
          onPress={() => navigation.goBack()}
        />

        <TouchableOpacity
          style={{
            padding: 10,
          }}
          onPress={() => {
            setOneTimeUse50(true);
            if (oneTimeUse === true) {
              alert('50 50 one time use ');
              return null;
            }
            let temp = [...questions];
            let count = 0;
            temp.forEach((element, index) => {
              if (index === selectedIndex) {
                element.allOptions.forEach((element_sub, index_sub) => {
                  if (element.correct_answer === element_sub) {
                    element.allOptions[index_sub] = element.correct_answer;
                  } else {
                    if (count < 1) {
                      count++;
                      element.allOptions[index_sub] = element_sub;
                    } else {
                      element.allOptions[index_sub] = '';
                    }
                  }
                });
              }
            });
            setQuestions(temp);
          }}>
          <Text style={{fontSize: 16, marginLeft: 10}}>{'50/50'}</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={{fontSize: 16, marginLeft: 10}}>{title}</Text>

        {/* Correct and incorrect count */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {/* Correct */}
          <View
            style={{
              backgroundColor: COLORS.success,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderTopLeftRadius: 10,
              borderBottomLeftRadius: 10,
            }}>
            <MaterialIcons
              name="check"
              size={14}
              style={{color: COLORS.white}}
            />
            <Text style={{color: COLORS.white, marginLeft: 6}}>
              {correctCount}
            </Text>
          </View>

          {/* Incorrect */}
          <View
            style={{
              backgroundColor: COLORS.error,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderTopRightRadius: 10,
              borderBottomRightRadius: 10,
            }}>
            <MaterialIcons
              name="close"
              size={14}
              style={{color: COLORS.white}}
            />
            <Text style={{color: COLORS.white, marginLeft: 6}}>
              {incorrectCount}
            </Text>
          </View>
        </View>
      </View>

      {/* Questions and Options list */}
      <FlatList
        data={questions}
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
        }}
        showsVerticalScrollIndicator={false}
        extraData={selectedIndex}
        keyExtractor={item => item.question}
        renderItem={({item, index}) => (
          <>
            {selectedIndex === index ? (
              <View
                style={{
                  marginTop: 14,
                  marginHorizontal: 10,
                  backgroundColor: COLORS.white,
                  elevation: 2,
                  borderRadius: 2,
                }}>
                <View style={{padding: 20}}>
                  <Text style={{fontSize: 16}}>
                    {index + 1}. {item.question}
                  </Text>
                  {item.imageUrl != '' ? (
                    <Image
                      source={{
                        uri: item.imageUrl,
                      }}
                      resizeMode={'contain'}
                      style={{
                        width: '80%',
                        height: 150,
                        marginTop: 20,
                        marginLeft: '10%',
                        borderRadius: 5,
                      }}
                    />
                  ) : null}
                </View>
                {/* Options */}
                {item.allOptions.map((option, optionIndex) => {
                  return (
                    <TouchableOpacity
                      key={optionIndex}
                      style={{
                        paddingVertical: 14,
                        paddingHorizontal: 20,
                        borderTopWidth: 1,
                        borderColor: COLORS.border,
                        backgroundColor: getOptionBgColor(item, option),
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                      }}
                      onPress={() => {
                        if (item.selectedOption) {
                          console.log('sdsad', item.selectedOption);
                          return null;
                        }
                        // Increase correct/incorrect count
                        if (option == item.correct_answer) {
                          setCorrectCount(correctCount + 1);
                        } else {
                          setIncorrectCount(incorrectCount + 1);
                        }

                        setAnsSelected(true);
                        let tempQuestions = [...questions];
                        tempQuestions[index].selectedOption = option;
                        setQuestions([...tempQuestions]);
                      }}>
                      {option != '' ? (
                        <>
                          <Text
                            style={{
                              width: 25,
                              height: 25,
                              padding: 2,
                              borderWidth: 1,
                              borderColor: COLORS.border,
                              textAlign: 'center',
                              marginRight: 16,
                              borderRadius: 25,
                              color: getOptionTextColor(item, option),
                            }}>
                            {optionIndex + 1}
                          </Text>
                          <Text
                            style={{color: getOptionTextColor(item, option)}}>
                            {option}
                          </Text>
                        </>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </>
        )}
        ListFooterComponent={() => (
          <FormButton
            labelText={
              selectedIndex === questions.length - 1 ? 'Submit' : 'Next'
            }
            style={{margin: 10}}
            handleOnPress={() => {
              // Show Result modal
              if (ansSelected === false) {
                alert('please select answer');
                return null;
              }

              setAnsSelected(false);
              if (selectedIndex === questions.length - 1) {
                setIsResultModalVisible(true);
              } else {
                setSelectedIndex(selectedIndex + 1);
              }
            }}
          />
        )}
      />

      {/* Result Modal */}
      <ResultModal
        isModalVisible={isResultModalVisible}
        correctCount={correctCount}
        incorrectCount={incorrectCount}
        totalCount={questions.length}
        handleOnClose={() => {
          setIsResultModalVisible(false);
        }}
        handleRetry={() => {
          setCorrectCount(0);
          setIncorrectCount(0);
          getQuizAndQuestionDetails();
          setIsResultModalVisible(false);
        }}
        handleHome={() => {
          navigation.goBack();
          setIsResultModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
};

export default PlayQuizScreen;
