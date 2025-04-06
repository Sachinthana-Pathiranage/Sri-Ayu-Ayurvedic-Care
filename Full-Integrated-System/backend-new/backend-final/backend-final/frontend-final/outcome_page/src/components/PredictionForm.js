import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Icon,
} from '@mui/material';
import { motion } from 'framer-motion';
import { ReactComponent as AyurvedaLogo } from './ayurveda-logo.svg';
import { UserIcon, PresentationChartBarIcon, HeartIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, delay: 0.2 } },
};

const formControlStyle = {
  margin: '16px 0',
  width: '100%',
};

const cardStyle = {
  maxWidth: 600,
  margin: 'auto',
  padding: 3,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRadius: '15px',
  boxShadow: '0 8px 32px rgba(0, 128, 128, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
};

const PredictionForm = () => {
  const [disease, setDisease] = useState('');
  const [treatments, setTreatments] = useState([]);
  const [selectedTreatment, setSelectedTreatment] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [severity, setSeverity] = useState('');
  const [successCategory, setSuccessCategory] = useState(null);
  const [recoveryTime, setRecoveryTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const diseases = ['Migraine', 'Gastritis', 'Diabetes', 'Common Cold'];

  useEffect(() => {
    if (disease) {
      fetchOptions();
    }
  }, [disease]);

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:5000/get_options', {
        disease,
      });
      setTreatments(res.data.treatments);
      setSymptoms(res.data.symptoms);
      setSelectedTreatment('');
      setSelectedSymptom('');
    } catch (err) {
      console.error('Error fetching options:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const data = {
        disease,
        treatment: selectedTreatment,
        symptoms: selectedSymptom,
        severity,
      };

      const successRes = await axios.post(
        'http://127.0.0.1:5000/predict/success',
        data
      );
      setSuccessCategory(successRes.data.success_category);

      const recoveryRes = await axios.post(
        'http://127.0.0.1:5000/predict/recovery',
        data
      );
      setRecoveryTime(recoveryRes.data.recovery_time);
    } catch (error) {
      console.error('Error predicting:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.Container
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      maxWidth="md"
    >
      <Card style={cardStyle} component={motion.div} whileHover={{ scale: 1.02 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center" justifyContent="center">
            <Grid item xs={12} sm={4} md={3}>
              <AyurvedaLogo style={{ width: '100%', height: 'auto' }} />
            </Grid>
            <Grid item xs={12} sm={8} md={9}>
              <Typography
                variant="h5"
                align="center"
                color="primary"
                gutterBottom
              >
                Ayurvedic Treatment Outcome Prediction
              </Typography>
            </Grid>
          </Grid>

          {/* Disease Selection */}
          <FormControl fullWidth style={formControlStyle}>
            <InputLabel id="disease-label">
              Disease <Icon component={UserIcon} sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            </InputLabel>
            <Select
              labelId="disease-label"
              id="disease"
              value={disease}
              label="Disease"
              onChange={(e) => setDisease(e.target.value)}
            >
              <MenuItem value="">
                <em>Select a Disease</em>
              </MenuItem>
              {diseases.map((dis) => (
                <MenuItem key={dis} value={dis}>
                  {dis}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Treatment Selection */}
          <FormControl fullWidth style={formControlStyle}>
            <InputLabel id="treatment-label">
              Treatment <Icon component={PresentationChartBarIcon} sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            </InputLabel>
            <Select
              labelId="treatment-label"
              id="treatment"
              value={selectedTreatment}
              label="Treatment"
              onChange={(e) => setSelectedTreatment(e.target.value)}
              disabled={!disease}
            >
              <MenuItem value="">
                <em>Select a Treatment</em>
              </MenuItem>
              {treatments.map((treat) => (
                <MenuItem key={treat} value={treat}>
                  {treat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Symptoms Selection */}
          <FormControl fullWidth style={formControlStyle}>
            <InputLabel id="symptoms-label">
              Symptoms <Icon component={HeartIcon} sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            </InputLabel>
            <Select
              labelId="symptoms-label"
              id="symptoms"
              value={selectedSymptom}
              label="Symptoms"
              onChange={(e) => setSelectedSymptom(e.target.value)}
              disabled={!disease}
            >
              <MenuItem value="">
                <em>Select a Symptom</em>
              </MenuItem>
              {symptoms.map((symp) => (
                <MenuItem key={symp} value={symp}>
                  {symp}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Severity Selection */}
          <FormControl fullWidth style={formControlStyle}>
            <InputLabel htmlFor="severity">
              Severity <Icon component={ExclamationCircleIcon} sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            </InputLabel>
            <Select
              labelId="severity-label"
              id="severity"
              value={severity}
              label="Severity"
              onChange={(e) => setSeverity(e.target.value)}
            >
              <MenuItem value="">
                <em>Select Severity</em>
              </MenuItem>
              <MenuItem value="Mild">Mild</MenuItem>
              <MenuItem value="Moderate">Moderate</MenuItem>
              <MenuItem value="Severe">Severe</MenuItem>
            </Select>
          </FormControl>

          {/* Predict Button */}
          <Box mt={2} textAlign="center">
            <Button
              variant="contained"
              color="primary"
              onClick={handlePredict}
              disabled={
                !selectedTreatment || !selectedSymptom || !severity || loading
              }
              style={{ backgroundColor: '#00a6a6', color: '#fff' }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Predict'
              )}
            </Button>
          </Box>

          {/* Display Results */}
          {successCategory !== null && (
            <Box mt={3} p={2} bgcolor="#b2dfdb" borderRadius={1}>
              <Typography variant="subtitle1" color="primary">
                Success Prediction: {successCategory}
              </Typography>
            </Box>
          )}
          {recoveryTime !== null && (
            <Box mt={2} p={2} bgcolor="#b2dfdb" borderRadius={1}>
              <Typography variant="subtitle1" color="primary">
                Estimated Recovery Time: {recoveryTime} days
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.Container>
  );
};

export default PredictionForm;