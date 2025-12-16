import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTranslation } from '@/i18n';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import { Ionicons } from '@expo/vector-icons';
import { generateMonthlyPdf } from '@/api/generate-monthly-pdf';
import { useTheme } from '@/theme/context/ThemeContext';
import { capitalizeFirstLetter } from '@/utils/string';
import { fileSystemService } from '@/utils/fileSystem';
import {
  Container,
  Header,
  BackButton,
  HeaderTitle,
  Content,
  PreviewContainer,
  LoadingContainer,
  ErrorBox,
  ErrorText,
  ButtonRow,
  PrimaryButton,
  SecondaryButton,
  ButtonText,
  SecondaryButtonText,
} from './styles';

export type ReportPreviewRouteParams = {
  ReportPreview: {
    startDate: string;
    endDate: string;
    monthLabel?: string;
  };
};

export type ReportPreviewRouteProp = RouteProp<ReportPreviewRouteParams, 'ReportPreview'>;

export function ReportPreviewScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<ReportPreviewRouteProp>();
  const { startDate, endDate, monthLabel } = route.params;
  const { theme } = useTheme();

  const [pdfBase64, setPdfBase64] = useState<string>('');
  const [fileName, setFileName] = useState<string>('report.pdf');
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        const response = await generateMonthlyPdf(startDate, endDate);
        if (!isMounted) return;

        setPdfBase64(response.pdfBase64);
        setFileName(response.fileName || 'report.pdf');

        // Use the new FileSystem service to write the PDF to cache
        const cacheUri = await fileSystemService.writeBase64File(
          response.fileName,
          response.pdfBase64
        );
        
        if (!isMounted) return;
        setFileUri(cacheUri);
      } catch (error: any) {
        console.error('Erro ao carregar PDF:', error);
        if (!isMounted) return;
        setErrorMessage(
          error.response?.data?.message ||
            error.message ||
            t('history.pdfGenerationError')
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [startDate, endDate, t]);

  const handleShare = async () => {
    if (!fileUri) {
      Alert.alert(t('common.error'), t('history.previewUnavailable'));
      return;
    }

    try {
      setIsSharing(true);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: t('history.shareReportTitle'),
        });
      } else {
        Alert.alert(t('common.error'), t('history.shareNotAvailable'));
      }
    } catch (error: any) {
      console.error('Erro ao compartilhar PDF:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        t('history.pdfGenerationError');
      Alert.alert(t('common.error'), errorMessage);
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = async () => {
    if (!pdfBase64) {
      Alert.alert(t('common.error'), t('history.previewUnavailable'));
      return;
    }

    try {
      setIsDownloading(true);
      
      // Use the new FileSystem service to write the PDF to documents
      await fileSystemService.writeBase64ToDocuments(fileName, pdfBase64);
      
      Alert.alert(t('common.success'), t('history.downloadSuccess'));
    } catch (error: any) {
      console.error('Erro ao salvar PDF:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        t('history.downloadError');
      Alert.alert(t('common.error'), errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Container>
      <Header>
        <BackButton onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
        </BackButton>
        <HeaderTitle>
          {monthLabel ? capitalizeFirstLetter(monthLabel) : t('history.reportPreview')}
        </HeaderTitle>
      </Header>

      <Content>
        <PreviewContainer>
          {isLoading ? (
            <LoadingContainer>
              <ActivityIndicator size="large" color={theme.primary} />
            </LoadingContainer>
          ) : errorMessage ? (
            <LoadingContainer>
              <ErrorBox>
                <ErrorText>{errorMessage}</ErrorText>
              </ErrorBox>
            </LoadingContainer>
          ) : fileUri ? (
            <WebView
              originWhitelist={["*"]}
              source={{ uri: fileUri }}
              style={{ flex: 1, backgroundColor: theme.background.secondary }}
              onError={({ nativeEvent }) => {
                console.error('Erro WebView PDF:', nativeEvent);
                if (Platform.OS === 'android' && fileUri) {
                  FileSystemLegacy.getContentUriAsync(fileUri).then((contentUri) => {
                    IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                      data: contentUri,
                      flags: 1,
                      type: 'application/pdf',
                    }).catch(err => {
                      console.error('Intent VIEW PDF error:', err);
                      setErrorMessage(t('history.previewUnavailable'));
                    });
                  }).catch(err => {
                    console.error('getContentUriAsync error:', err);
                    setErrorMessage(t('history.previewUnavailable'));
                  });
                } else {
                  setErrorMessage(t('history.previewUnavailable'));
                }
              }}
            />
          ) : (
            <LoadingContainer>
              <ErrorBox>
                <ErrorText>{t('history.previewUnavailable')}</ErrorText>
              </ErrorBox>
            </LoadingContainer>
          )}
        </PreviewContainer>

        <ButtonRow>
          <PrimaryButton onPress={handleShare} disabled={isLoading || isSharing} activeOpacity={0.7}>
            {isSharing ? (
              <ActivityIndicator size="small" color={theme.text.inverse} />
            ) : (
              <Ionicons name="share-outline" size={18} color={theme.text.inverse} />
            )}
            <ButtonText>{t('history.shareReport')}</ButtonText>
          </PrimaryButton>

          <SecondaryButton onPress={handleDownload} disabled={isLoading || isDownloading} activeOpacity={0.7}>
            {isDownloading ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <Ionicons name="download-outline" size={18} color={theme.primary} />
            )}
            <SecondaryButtonText>{t('history.downloadReport')}</SecondaryButtonText>
          </SecondaryButton>
        </ButtonRow>
      </Content>
    </Container>
  );
}
