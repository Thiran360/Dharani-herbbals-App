/**
 * Dharani Herbbals AI Assistant / Chatbot Component
 * Luxury botanical mobile chatbot powered by Dharani Herbal Knowledge Base
 * Supports bilingual (Tamil & English) instant answers, quick remedy suggestions,
 * and direct WhatsApp customer support.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  Platform,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from './Icons';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';
import { BUSINESS_INFO } from '../../constants/config';

const BOT_KNOWLEDGE = [
  {
    keywords: ['hair', 'முடி', 'hair fall', 'முடி உதிர்வு', 'growth', 'dandruff', 'பொடுகு', 'shampoo'],
    responseEn: "🌿 For hair care & reducing hair fall, we highly recommend our Hibiscus (Chemparuthi) Shampoo, Arppu Shampoo, and Pure Herbal Hair Wash Powders. They nourish hair roots, eliminate dandruff, and promote thick natural hair growth!",
    responseTa: "🌿 முடி உதிர்வைக் கட்டுப்படுத்தி, அடர்த்தியாக வளர எங்களின் செம்பருத்தி ஷாம்பு, அரப்பு ஷாம்பு மற்றும் மூலிகை சிகைக்காய் பவுடர் மிகவும் சிறந்தது. பொடுகை நீக்கி கூந்தலை ஆரோக்கியமாக வைக்கும்!",
  },
  {
    keywords: ['skin', 'சருமம்', 'glow', 'பளபளப்பு', 'face', 'முகம்', 'pimple', 'பரு', 'tan', 'nalangu'],
    responseEn: "✨ For natural glowing skin and tan removal, our Nalangu Powder and Multhani Metti Face Packs are customer favorites! They gently cleanse, clear dark spots, and give radiant skin without chemicals.",
    responseTa: "✨ பளபளப்பான சருமம் மற்றும் முகப்பரு/கருமை நீங்க எங்களின் பாரம்பரிய நலங்கு மாவு மற்றும் முல்தானி மெட்டி ஃபேஸ்பேக் சிறந்த தேர்வு! 100% இயற்கை முறையில் முகம் பொலிவு பெறும்.",
  },
  {
    keywords: ['soap', 'சோப்', 'bath', 'குளியல்', 'body wash'],
    responseEn: "🧼 We craft handmade herbal soaps including Aloe Vera Soap, Neem Tulsi Soap, and Red Sandalwood Soap. 100% natural and gentle on all skin types!",
    responseTa: "🧼 எங்களின் கற்றாழை சோப், வேம்பு துளசி சோப் மற்றும் ரத்த சந்தன சோப் சருமத்தை மென்மையாகவும் நறுமணத்துடனும் பாதுகாக்கும். ரசாயனம் அற்ற 100% இயற்கை தயாரிப்பு!",
  },
  {
    keywords: ['track', 'டிராக்கிங்', 'order', 'ஆர்டர்', 'delivery', 'டெலிவரி', 'shipping'],
    responseEn: "🚚 Orders are dispatched within 24-48 hours across India! You can track your order in the Orders tab or contact our dispatch team via WhatsApp with your Order ID.",
    responseTa: "🚚 அனைத்து ஆர்டர்களும் 24-48 மணி நேரத்திற்குள் இந்தியா முழுவதும் அனுப்பப்படும்! உங்கள் ஆர்டரை Orders பிரிவில் கண்காணிக்கலாம் அல்லது வாட்ஸ்அப்பில் எங்களை தொடர்பு கொள்ளலாம்.",
  },
  {
    keywords: ['cod', 'payment', 'பணம்', 'pay', 'upi', 'gpay', 'cash on delivery'],
    responseEn: "💳 We support UPI (GPay, PhonePe, Paytm), Net Banking, Debit/Credit Cards, and Cash on Delivery (COD) across serviceable pin codes in India!",
    responseTa: "💳 UPI (GPay, PhonePe), நெட் பேங்கிங், கார்டு மற்றும் Cash on Delivery (COD) போன்ற அனைத்து கட்டண முறைகளும் உள்ளன!",
  },
  {
    keywords: ['whatsapp', 'call', 'contact', 'support', 'உதவி', 'phone', 'help', 'டாக்டர்'],
    responseEn: `📞 You can chat with our herbal specialists directly on WhatsApp at +91 97881 22001 or call +91 99655 32001. We are happy to guide you!`,
    responseTa: `📞 எங்களின் மூலிகை மருத்துவ நிபுணர்களுடன் வாட்ஸ்அப்பில் நேரடியாக பேச +91 97881 22001 என்ற எண்ணில் தொடர்பு கொள்ளுங்கள்!`,
  },
  {
    keywords: ['offer', 'சலுகை', 'discount', 'தள்ளுபடி', 'coupon'],
    responseEn: "🎁 Special introductory prices are active! Our Arppu & Aloe Vera Shampoos are available at just ₹65. Check the Handpicked Deals section for more!",
    responseTa: "🎁 சிறப்பு சலுகைகள் தற்போது கிடைக்கின்றன! அரப்பு மற்றும் கற்றாழை ஷாம்பு வெறும் ₹65-க்கு கிடைக்கிறது. மேலும் சலுகைகளை ஹோம் பேஜில் பார்க்கலாம்!",
  },
  {
    keywords: ['return', 'refund', 'ரிட்டர்ன்', 'cancel', 'கேனசல்'],
    responseEn: "🔄 We offer a hassle-free 7-day replacement policy for damaged or incorrect deliveries. Simply WhatsApp our support team with a photo of the package.",
    responseTa: "🔄 ஏதேனும் சேதம் அல்லது தவறான தயாரிப்பு இருந்தால் 7 நாட்களுக்குள் மாற்றித் தரப்படும். வாட்ஸ்அப்பில் எங்களுக்கு தகவல் தெரிவிக்கலாம்.",
  },
];

export const ChatbotModal = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const { isTamil } = useLanguage();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: isTamil
        ? "வணக்கம்! 👋 நான் தாரணி ஹெர்பல்ஸ் அசிஸ்டன்ட். முடி பராமரிப்பு, சரும பாதுகாப்பு அல்லது ஆர்டர் பற்றி ஏதேனும் கேட்க வேண்டுமா?"
        : "Hello! 👋 I'm the Dharani Herbbals Assistant. Ask me anything about our natural herbal remedies, skincare, hair care, or orders!",
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef();

  const quickQuestions = isTamil
    ? [
        '🌿 முடி உதிர்வு தீர்வுகள்',
        '✨ பளபளப்பான சருமம்',
        '🧼 மூலிகை சோப் & ஷாம்பு',
        '🚚 ஆர்டர் டிராக்கிங்',
        '📞 வாட்ஸ்அப் உதவி',
      ]
    : [
        '🌿 Hair Fall Remedies',
        '✨ Glowing Skin Care',
        '🧼 Herbal Soaps & Shampoos',
        '🚚 Track Order & Delivery',
        '📞 WhatsApp Support',
      ];

  const handleSend = textToSend => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: 'Just now',
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const qLower = query.toLowerCase();
      let match = BOT_KNOWLEDGE.find(item =>
        item.keywords.some(k => qLower.includes(k.toLowerCase()))
      );

      let botReply = '';
      if (match) {
        botReply = isTamil ? match.responseTa : match.responseEn;
      } else {
        botReply = isTamil
          ? "உங்கள் கேள்விக்கு நன்றி! 100% இயற்கை தயாரிப்புகள் மற்றும் மருத்துவரின் தனிப்பட்ட ஆலோசனைக்கு எங்கள் வாட்ஸ்அப் எண்ணில் (+91 97881 22001) தொடர்பு கொள்ளவும்."
          : "Thank you for asking! For personalized herbal suggestions or custom doctor consultation, please feel free to chat with us directly on WhatsApp (+91 97881 22001).";
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: botReply,
          time: 'Just now',
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  const openWhatsApp = () => {
    Linking.openURL('https://wa.me/919788122001?text=Hello%20Dharani%20Herbbals%2C%20I%20need%20assistance');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarCircle}>
              <Icon name="leaf" size={18} color="#FFFFFF" />
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>
                {isTamil ? 'தாரணி ஹெர்பல் அசிஸ்டன்ட்' : 'Dharani Herbal Assistant'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {isTamil ? '100% இயற்கை சித்த மருத்துவ நிபுணர்' : '100% Natural Herbal Expert'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* WhatsApp Banner */}
        <TouchableOpacity style={styles.whatsAppBanner} onPress={openWhatsApp} activeOpacity={0.88}>
          <Icon name="whatsapp" size={18} color="#25D366" />
          <Text style={styles.whatsAppBannerText}>
            {isTamil ? 'மருத்துவருடன் வாட்ஸ்அப்பில் பேச இங்கே தொடவும்' : 'Chat directly with our Herbal Specialist on WhatsApp'}
          </Text>
        </TouchableOpacity>

        {/* Messages List */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(msg => (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                msg.sender === 'user' ? styles.userRow : styles.botRow,
              ]}
            >
              {msg.sender === 'bot' && (
                <View style={styles.botIcon}>
                  <Icon name="leaf" size={13} color="#FFFFFF" />
                </View>
              )}
              <View
                style={[
                  styles.bubble,
                  msg.sender === 'user' ? styles.userBubble : styles.botBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.sender === 'user' ? styles.userMessageText : styles.botMessageText,
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}

          {isTyping && (
            <View style={[styles.messageRow, styles.botRow]}>
              <View style={styles.botIcon}>
                <Icon name="leaf" size={13} color="#FFFFFF" />
              </View>
              <View style={[styles.bubble, styles.botBubble, styles.typingBubble]}>
                <Text style={styles.typingText}>
                  {isTamil ? 'தாரணி பதிலளிக்கிறது...' : 'Dharani Assistant is thinking...'}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Suggestion Chips */}
        <View style={styles.chipsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {quickQuestions.map((q, idx) => (
              <TouchableOpacity
                key={`chip-${idx}`}
                style={styles.chip}
                onPress={() => handleSend(q)}
                activeOpacity={0.8}
              >
                <Text style={styles.chipText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder={isTamil ? 'மூலிகை தயாரிப்புகள் பற்றி கேட்கவும்...' : 'Ask about herbal care, remedies, delivery...'}
            placeholderTextColor="#8F9F94"
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendBtnText}>➔</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export const FloatingChatbotButton = ({ onPress }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  return (
    <Animated.View style={[styles.fabContainer, { transform: [{ scale: pulseAnim }] }]}>
      <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.85}>
        <View style={styles.fabInner}>
          <Icon name="leaf" size={18} color="#FFFFFF" />
          <Text style={styles.fabBadge}>AI</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27, 77, 62, 0.08)',
    ...SHADOWS.small,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1B4D3E',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#133E2B',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#5B8266',
    fontWeight: '600',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: '#1B4D3E',
    fontWeight: '700',
  },
  whatsAppBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(37, 211, 102, 0.2)',
  },
  whatsAppBannerText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1B4D3E',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: SPACING.md,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  botRow: {
    justifyContent: 'flex-start',
  },
  botIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1B4D3E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#1B4D3E',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: 'rgba(45, 106, 79, 0.14)',
    borderBottomLeftRadius: 4,
    ...SHADOWS.small,
  },
  typingBubble: {
    backgroundColor: '#F3F7F4',
  },
  messageText: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  botMessageText: {
    color: '#0D2818',
    fontWeight: '500',
  },
  typingText: {
    fontSize: 12,
    color: '#5B8266',
    fontStyle: 'italic',
  },
  chipsWrapper: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(27, 77, 62, 0.06)',
    paddingVertical: 8,
  },
  chipsScroll: {
    paddingHorizontal: SPACING.md,
    gap: 8,
  },
  chip: {
    backgroundColor: '#EAF1EB',
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  chipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1B4D3E',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(27, 77, 62, 0.1)',
    gap: 10,
  },
  input: {
    flex: 1,
    height: 42,
    backgroundColor: '#F4F7F4',
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    fontSize: 13.5,
    color: '#133E2B',
    borderWidth: 1,
    borderColor: 'rgba(27, 77, 62, 0.12)',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1B4D3E',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  sendBtnDisabled: {
    backgroundColor: '#A8BDAF',
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    zIndex: 999,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1B4D3E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#A7F3D0',
    ...Platform.select({
      ios: {
        shadowColor: '#1B4332',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  fabInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabBadge: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#A7F3D0',
    letterSpacing: 0.5,
  },
});

export default ChatbotModal;
