import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Typography, FormControl, InputLabel, Select, MenuItem, Button, Box,
    CircularProgress, Card, CardContent, Icon, Grid, Stack, Paper, Chip, Alert, AlertTitle // Added Alert components
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HealingIcon from '@mui/icons-material/Healing';
import ScienceIcon from '@mui/icons-material/Science';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'; // Icon for disclaimer
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'; // Icon for Low success warning
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined'; // Icon for High success note
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'; // Icon for Medium success note


import { motion, AnimatePresence } from 'framer-motion';
import { UserIcon, PresentationChartBarIcon, HeartIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { teal, purple, red, amber, green, grey, blue } from '@mui/material/colors';
import { alpha } from '@mui/material/styles'; // Correct import for alpha

// --- Animation Variants (Keep as before) ---
const containerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.1, type: 'spring', stiffness: 90, damping: 15 } },
};

const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] } },
};

const resultsContainerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut", when: "beforeChildren", staggerChildren: 0.15 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } }
}

const resultsItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, type: 'spring', stiffness: 100, damping: 14 } },
    exit: { opacity: 0, y: -10 }
}

// --- Styles ---

// Card Style: Enhanced Greenish Glassmorphism
const cardSx = {
    maxWidth: 750,
    margin: '50px auto',
    // Add margin bottom to prevent overlap with footer
    marginBottom: '80px', // Adjust value as needed
    padding: { xs: 3, sm: 4, md: 5 },
    // More pronounced green tint, adjust alpha for desired transparency
    backgroundColor: alpha(teal[50], 0.75), // Lighter teal base, moderate alpha
    backdropFilter: 'blur(20px) saturate(160%)', // Keep effective blur
    borderRadius: '30px',
    boxShadow: '0 14px 45px rgba(40, 160, 140, 0.25)', // Greener shadow
    border: `1px solid ${alpha(teal[200], 0.4)}`, // Subtle teal border
    overflow: 'hidden', // Keep overflow hidden
};

// Refined Select Styling (Keep as before)
const selectSx = {
    borderRadius: '18px', backgroundColor: alpha('#ffffff', 0.7),
    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(teal[500], 0.3), transition: 'border-color 0.3s ease, box-shadow 0.3s ease', },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(teal[500], 0.6), },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: teal[500], boxShadow: `0 0 0 3px ${alpha(teal[500], 0.2)}`, borderWidth: '1px !important', },
    '& .MuiSelect-icon': { color: teal[700], }, // Darker arrow
    '& .MuiInputBase-input': { color: teal[900], fontWeight: 500, padding: '14px 16px' },
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': { transform: 'scale(1.01)', boxShadow: `0 4px 10px ${alpha(teal[500], 0.1)}` }
};

// Refined MenuItem Styling (Keep as before)
const menuItemSx = {
    margin: '4px 8px', borderRadius: '10px', color: teal[800], fontSize: '0.95rem', transition: 'background-color 0.2s ease',
    '&:hover': { backgroundColor: alpha(teal[500], 0.1), color: teal[900], },
    '&.Mui-selected': { backgroundColor: `${alpha(teal[500], 0.2)} !important`, fontWeight: 600, color: teal[900], },
};

// Button Style (Keep as before)
const buttonSx = {
    marginTop: 3, backgroundColor: '#7E57C2', backgroundImage: 'linear-gradient(135deg, #8E24AA 0%, #5E35B1 100%)',
    color: 'white', borderRadius: '50px', padding: '13px 30px', fontSize: '1.05rem', fontWeight: 'bold',
    letterSpacing: '0.8px', textTransform: 'none', boxShadow: `0 7px 20px ${purple[700]}40`,
    transition: 'all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 1.5, position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)',
    '&:hover': { transform: 'translateY(-4px) scale(1.03)', boxShadow: `0 12px 28px ${purple[700]}55`, backgroundImage: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)', },
    '&:active': { transform: 'translateY(-1px) scale(1.01)' },
    '&:disabled': { background: grey[300], color: grey[500], cursor: 'not-allowed', boxShadow: 'none', backgroundImage: 'none', transform: 'none', '&::before': { display: 'none' } },
    '& .MuiButton-startIcon': { marginRight: '6px'},
    '&::before': { content: '""', position: 'absolute', top: '-10%', left: '-75%', width: '50%', height: '120%', background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)', transform: 'skewX(-25deg)', transition: 'left 0.8s ease-in-out', opacity: 0, pointerEvents: 'none', },
    '&:hover:not(:disabled)::before': { left: '125%', opacity: 0.6, transition: 'left 0.8s ease-in-out', },
};

// Results Paper Style (Keep as before)
const resultsPaperSx = {
    backgroundColor: alpha('#ffffff', 0.8), backdropFilter: 'blur(12px) saturate(160%)',
    padding: { xs: 2.5, sm: 3.5, md: 4 }, borderRadius: '24px', border: `1px solid ${alpha(teal[300], 0.5)}`,
    boxShadow: '0 10px 30px rgba(0, 128, 128, 0.1)',
}

// --- Component ---
const PredictionForm = () => {
    // State hooks remain the same...
    const [disease, setDisease] = useState('');
    const [treatments, setTreatments] = useState([]);
    const [selectedTreatment, setSelectedTreatment] = useState('');
    const [symptoms, setSymptoms] = useState([]);
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [severity, setSeverity] = useState('');
    const [successCategory, setSuccessCategory] = useState(null);
    const [recoveryTimeRange, setRecoveryTimeRange] = useState(null);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const diseases = ['Migraine', 'Gastritis', 'Diabetes', 'Common Cold'];

    // useEffect and API calls (fetchOptions, handlePredict) remain unchanged...
    useEffect(() => {
      if (disease) {
        fetchOptions();
      } else {
          // Clear options if disease is deselected
          setTreatments([]);
          setSymptoms([]);
          setSelectedTreatment('');
          // setSelectedSymptom(''); // <-- Remove this line
          setSelectedSymptoms([]); // <-- Use this line to reset the array
          setSeverity('');
          setSuccessCategory(null);
          setRecoveryTimeRange(null);
          setApiError(null);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disease]);

  const fetchOptions = async () => {
    setLoading(true);
    setApiError(null);
    // Clear dependent dropdowns and results when fetching new options
    setTreatments([]);
    setSymptoms([]);
    setSelectedTreatment('');
    // setSelectedSymptom(''); // <-- Remove this line
    setSelectedSymptoms([]); // <-- Use this line to reset the array
    setSeverity('');
    setSuccessCategory(null);
    setRecoveryTimeRange(null);
        try {
          const res = await axios.post('http://127.0.0.1:5000/outcome/get_options', { disease });
          if (res.data && Array.isArray(res.data.treatments) && Array.isArray(res.data.symptoms)) {
            setTreatments(res.data.treatments); setSymptoms(res.data.symptoms);
          } else { setApiError('Failed to load options.'); }
        } catch (err) { setApiError(`Error fetching options: ${err.response?.data?.error || err.message}`); }
        finally { setLoading(false); }
    };

    const handlePredict = async () => {
      setLoading(true); setApiError(null); setSuccessCategory(null); setRecoveryTimeRange(null);
      try {
        console.log('Sending data:', {
            disease,
            treatment: selectedTreatment,
            symptoms: selectedSymptoms,
            severity
        });
        const data = {
            disease,
            treatment: selectedTreatment,
            symptoms: selectedSymptoms,
            severity
        };
          const [successRes, recoveryRes] = await Promise.all([
            axios.post('http://127.0.0.1:5000/outcome/predict/success', data),
            axios.post('http://127.0.0.1:5000/outcome/predict/recovery', data)
          ]);
          if (successRes.data?.success_category) { setSuccessCategory(successRes.data.success_category); }
          else { throw new Error('Invalid success data.'); }
          if (recoveryRes.data?.recovery_time_range) { setRecoveryTimeRange(recoveryRes.data.recovery_time_range); }
          else { throw new Error('Invalid recovery data.'); }
        } catch (error) { setApiError(`Prediction failed: ${error.response?.data?.error || error.message}`); setSuccessCategory(null); setRecoveryTimeRange(null); }
        finally { setLoading(false); }
    };


    // --- Gauge Data/Color Logic (ENSURING CORRECT COLORS) ---
    const getGaugeDataAndColor = (category) => {
        let value = 0;
        let color = grey[400];
        let icon = null;
        let description = "Prediction reflects the likelihood based on similar cases."; // Default description

        if (category === 'Low') {
            value = 33; color = red[500]; icon = <CancelOutlinedIcon sx={{ color: color, fontSize: 'inherit' }} />;
            description = "Lower likelihood of full success. Discuss alternatives with your practitioner.";
        } else if (category === 'Medium') {
            value = 66; color = amber[600]; icon = <ReportProblemOutlinedIcon sx={{ color: color, fontSize: 'inherit' }} />;
            description = "Moderate chance of success. Monitor progress closely.";
        } else if (category === 'High') {
            value = 100; color = green[600]; icon = <CheckCircleOutlineIcon sx={{ color: color, fontSize: 'inherit' }} />;
            description = "High probability of a successful outcome with this approach.";
        }
        return { data: [{ name: category || 'N/A', value: value, fill: color }], color, icon, description };
    };
    const { data: gaugeData, color: gaugeColor, icon: successIcon, description: successDescription } = getGaugeDataAndColor(successCategory);

    return (
        // Removed outermost Box with page gradient
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* Added marginBottom to Card itself */}
            <Card sx={{ ...cardSx, marginBottom: { xs: 6, sm: 8, md: 10 } }} component={motion.div} whileHover={{ y: -6, boxShadow: '0 18px 50px rgba(40, 160, 140, 0.3)' }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <CardContent>
                    <Stack spacing={3.5} alignItems="center">

                        {/* --- Header --- */}
                        <motion.div variants={itemVariants} style={{width: '100%'}}>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%', mb: { xs: 2.5, sm: 3.5} }}>
                                 <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 250 }}>
                                     <Box sx={{ /* Outer gradient */
                                         position: 'relative', width: { xs: 60, sm: 70 }, height: { xs: 60, sm: 70 }, flexShrink: 0,
                                     }}>
                                         <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `linear-gradient(145deg, ${purple[400]}, ${purple[600]})`, boxShadow: `0 5px 15px ${purple[900]}35`, filter: 'blur(3px)', opacity: 0.9, }}/>
                                         <Box sx={{ /* Inner glass */
                                             position: 'relative', zIndex: 1, width: '100%', height: '100%', borderRadius: '50%',
                                             backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255, 255, 255, 0.6)',
                                             display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.8)'
                                         }}>
                                             {/* Icon remains purple */}
                                             <Icon component={PresentationChartBarIcon} sx={{ color: purple[600], fontSize: { xs: 28, sm: 34 } }} />
                                         </Box>
                                     </Box>
                                 </motion.div>
                                <Typography variant="h4" component="h1" sx={{ color: teal[800], fontWeight: 700, lineHeight: 1.25, flexGrow: 1, fontSize: { xs: '1.7rem', sm: '2.1rem', md: '2.4rem' } }}>
                                    Predict Treatment Outcome {/* Title Kept */}
                                </Typography>
                            </Stack>
                        </motion.div>

                                                {/* --- Form Controls with Animation --- */}
                                                {[
                            // Field definitions remain the same
                            { id: 'disease', label: 'Disease', value: disease, handler: setDisease, options: diseases, icon: UserIcon, disabled: loading },
                            { id: 'treatment', label: 'Treatment', value: selectedTreatment, handler: setSelectedTreatment, options: treatments, icon: HealingIcon, disabled: !disease || loading || treatments.length === 0, placeholder: treatments.length === 0 ? 'No treatments found' : 'Select a Treatment' },
                            { id: 'symptoms', label: 'Symptoms', value: selectedSymptoms, handler: setSelectedSymptoms, options: symptoms, icon: HeartIcon, disabled: !disease || loading || symptoms.length === 0, placeholder: symptoms.length === 0 ? 'No symptoms found' : 'Select Symptoms (Multiple)'}, // Updated placeholder
                            { id: 'severity', label: 'Severity', value: severity, handler: setSeverity, options: ["Mild", "Moderate", "Severe"], icon: ExclamationCircleIcon, disabled: !disease || loading }
                        ].map((field) => (
                          // Render each form control within its own animated div
                          <motion.div key={field.id} variants={itemVariants} style={{ width: '100%' }}>
                              <FormControl fullWidth disabled={field.disabled} >
                                  {/* Input Label - consistent for all */}
                                  <InputLabel
                                    id={`${field.id}-label`}
                                    sx={{ display: 'flex', alignItems: 'center', gap: 0.7, color: teal[700], '&.Mui-focused': { color: teal[800] } }}
                                   >
                                      <field.icon height={18} style={{ opacity: 0.8}} />
                                      {/* Adjust label for multi-select symptoms */}
                                      <span>{field.id === 'symptoms' ? `${field.label} (Multiple)` : field.label}</span>
                                  </InputLabel>

                                  {/* --- Conditional Select Rendering --- */}
                                  {field.id === 'symptoms' ? (
                                      // --- Multi-Select for Symptoms ---
                                      <Select
                                          labelId={`${field.id}-label`} // Use field.id for labelId
                                          id={`${field.id}-multi-select`} // Unique ID
                                          multiple
                                          value={field.value} // Use field.value (selectedSymptoms array)
                                          onChange={(event) => {
                                              const { target: { value } } = event;
                                              // Ensure value is always an array
                                              field.handler(typeof value === 'string' ? value.split(',') : value);
                                          }}
                                          sx={selectSx}
                                          label={field.label + " (Multiple)"} // Match InputLabel text
                                          renderValue={(selected) => ( // Render Chips for selected items
                                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxHeight: 60, overflowY: 'auto' }}> {/* Added scroll for many selections */}
                                                {selected.length === 0 ? (
                                                   <em style={{ opacity: 0.7, paddingLeft: '14px' }}>{field.placeholder || `Select ${field.label}`}</em>
                                                 ) : (
                                                   selected.map((value) => (
                                                     <Chip
                                                       key={value} label={value} size="small"
                                                       onDelete={(e) => { // Allow deleting chips (optional but nice UX)
                                                          e.stopPropagation(); // Prevent dropdown from opening
                                                          field.handler(field.value.filter((item) => item !== value));
                                                       }}
                                                       onMouseDown={(e) => e.stopPropagation()} // Prevent dropdown open on chip click
                                                       sx={{ backgroundColor: alpha(teal[500], 0.15), color: teal[900], fontWeight: 500, borderRadius: '8px', }}
                                                     />
                                                   ))
                                                 )}
                                              </Box>
                                            )}
                                          MenuProps={{ PaperProps: { sx: { maxHeight: 300, borderRadius: '16px', backdropFilter: 'blur(10px)', backgroundColor: alpha('#ffffff', 0.95), boxShadow: '0 6px 20px rgba(0,0,0,0.1)' } } }}
                                      >
                                          {field.options.map((opt) => ( // Use field.options (symptoms array)
                                              <MenuItem key={opt} value={opt} sx={menuItemSx}>
                                                   {/* Optional: Checkbox */}
                                                   {/* <Checkbox checked={field.value.includes(opt)} size="small" sx={{ padding: '0 8px 0 0' }}/> */}
                                                   {opt}
                                              </MenuItem>
                                          ))}
                                          {/* Conditional empty/disabled messages */}
                                          {field.options.length === 0 && disease && ( <MenuItem value="" disabled sx={menuItemSx}><em>No symptoms found</em></MenuItem> )}
                                          {!disease && field.id !== 'disease' && ( <MenuItem value="" disabled sx={menuItemSx}><em>Select Disease First</em></MenuItem> )}
                                      </Select>
                                  ) : (
                                      // --- Standard Single-Select for Others ---
                                      <Select
                                          labelId={`${field.id}-label`}
                                          id={`${field.id}-select`} // Unique ID
                                          value={field.value} // Use field.value (e.g., disease, selectedTreatment, severity)
                                          onChange={(e) => field.handler(e.target.value)} // Use field.handler
                                          sx={selectSx}
                                          label={field.label} // Match InputLabel text
                                          MenuProps={{ PaperProps: { sx: { maxHeight: 300, borderRadius: '16px', backdropFilter: 'blur(10px)', backgroundColor: alpha('#ffffff', 0.95), boxShadow: '0 6px 20px rgba(0,0,0,0.1)' } } }}
                                      >
                                          <MenuItem value="" disabled sx={menuItemSx}><em>{field.placeholder || `Select ${field.label}`}</em></MenuItem>
                                          {field.options.map((opt) => ( // Use field.options (e.g., diseases, treatments, severity levels)
                                              <MenuItem key={opt} value={opt} sx={menuItemSx}>
                                                  {opt}
                                              </MenuItem>
                                          ))}
                                           {/* Conditional empty/disabled messages */}
                                           {field.id !== 'disease' && field.id !== 'severity' && field.options.length === 0 && disease && ( <MenuItem value="" disabled sx={menuItemSx}><em>No options found</em></MenuItem> )}
                                           {!disease && field.id !== 'disease' && ( <MenuItem value="" disabled sx={menuItemSx}><em>Select Disease First</em></MenuItem> )}
                                      </Select>
                                  )}
                              </FormControl>
                          </motion.div>
                        ))}
                                         

                        {/* Predict Button  */}
                        <motion.div variants={itemVariants} style={{ width: '100%' }}>
                        <Button
                          variant="contained"
                          fullWidth
                          // Update disabled condition for symptoms
                          disabled={!disease || !selectedTreatment || selectedSymptoms.length === 0 || !severity || loading}
                          onClick={handlePredict}
                          sx={buttonSx}
                          startIcon={loading ? <CircularProgress size={22} color="inherit" /> : <ScienceIcon sx={{fontSize: 22}}/>}
                      >
                          {loading ? 'Analyzing...' : 'Predict Outcome'}
                      </Button>
                        </motion.div>

                        {/* Error Display (Style unchanged) */}
                        <AnimatePresence>
                            {apiError && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ width: '100%', marginTop: '10px' }}>
                                    <Paper elevation={0} sx={{ p: 1.5, backgroundColor: alpha(red[100], 0.9), borderRadius: '12px', border: `1px solid ${red[300]}` }}>
                                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                                            <ErrorOutlineIcon sx={{ color: red[600] }} fontSize="medium" />
                                            <Typography variant="body2" sx={{ color: red[800], fontWeight: 500 }}>{apiError}</Typography>
                                        </Stack>
                                    </Paper>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* --- ADVANCED Results Display V3 --- */}
                        <AnimatePresence>
                            {!loading && successCategory && recoveryTimeRange && !apiError && (
                            <motion.div variants={resultsContainerVariants} initial="hidden" animate="visible" exit="exit" style={{ width: '100%', marginTop: '32px' }}>
                                <Paper elevation={0} sx={resultsPaperSx}>
                                    <Typography variant="h5" component={motion.h5} variants={itemVariants} sx={{ textAlign: 'center', mb: 4, fontWeight: 'bold', color: teal[800] }}>
                                        Prediction Insights
                                    </Typography>
                                    <Grid container spacing={{ xs: 3, md: 5 }} alignItems="flex-start" justifyContent="center"> {/* Align items top */}

                                        {/* Success Gauge - Polished */}
                                        <Grid item xs={12} md={6} component={motion.div} variants={resultsItemVariants}>
                                            <Stack alignItems="center" spacing={1}> {/* Reduced spacing */}
                                                <Typography variant="h6" sx={{ fontWeight: 600, color: grey[800], mb: 1 }}> {/* Added mb */}
                                                    Success Likelihood
                                                </Typography>
                                                <Box sx={{ width: '100%', maxWidth: 250, height: 200, position: 'relative' }}> {/* Adjusted size */}
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <RadialBarChart innerRadius="70%" outerRadius="100%" barSize={28} data={gaugeData} startAngle={180} endAngle={-180}>
                                                            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                                            <RadialBar background={{ fill: alpha(grey[500], 0.15) }} dataKey="value" angleAxisId={0} cornerRadius="50%" isAnimationActive={true} animationDuration={1200} animationEasing="ease-out">
                                                                {gaugeData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.fill} /> ))}
                                                            </RadialBar>
                                                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" >
                                                                <tspan fontSize="3em" fontWeight="bold" fill={gaugeColor} dy="-0.05em" style={{ transition: 'fill 0.5s ease' }}>{successIcon}</tspan>
                                                                <tspan x="50%" dy="1.45em" fontSize="1.1em" fill={grey[800]} fontWeight="500">{gaugeData[0]?.name}</tspan>
                                                            </text>
                                                            <Tooltip
                                                                cursor={{ fill: alpha(gaugeColor, 0.1), strokeWidth: 0 }}
                                                                contentStyle={{ backgroundColor: alpha('#212121', 0.9), color: '#fff', borderRadius: '10px', border: 'none', padding: '10px 15px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                                                                formatter={(value, name, props) => [ <span style={{ color: props.payload.fill, fontWeight: 'bold' }}>{props.payload.name} Category</span>, <span style={{ color: grey[300], fontSize: '0.9em' }}>{`${value}% Estimated Success`}</span> ]}
                                                                labelStyle={{ display: 'none' }} animationDuration={300}
                                                            />
                                                        </RadialBarChart>
                                                    </ResponsiveContainer>
                                                </Box>
                                                {/* Descriptive Text based on Category */}
                                                <Typography variant="body2" sx={{ color: grey[700], textAlign: 'center', mt: 1.5, maxWidth: '90%', minHeight: '3em' }}> {/* Added minHeight */}
                                                    {successDescription}
                                                </Typography>
                                            </Stack>
                                        </Grid>

                                        {/* Recovery Time & Context - Polished */}
                                        <Grid item xs={12} md={6} component={motion.div} variants={resultsItemVariants}>
                                             <Stack alignItems="center" spacing={2}>
                                                <Typography variant="h6" sx={{ fontWeight: 600, color: grey[800] }}>Estimated Recovery</Typography>
                                                <Paper elevation={0} sx={{ background: `linear-gradient(145deg, ${alpha(teal[50], 0.8)}, ${alpha(blue[50], 0.7)})`, padding: '18px 30px', borderRadius: '18px', border: `1px solid ${alpha(teal[200], 0.8)}`, textAlign: 'center', minWidth: 190, boxShadow: '0 4px 12px rgba(0, 128, 128, 0.1)', }}>
                                                    <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                                                        <CalendarMonthIcon sx={{ color: teal[700], fontSize: 30 }} />
                                                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: teal[900], lineHeight: 1.2 }}>
                                                            {recoveryTimeRange}
                                                        </Typography>
                                                    </Stack>
                                                 </Paper>
                                                <Chip
                                                    label={`Severity: ${severity}`}
                                                    size="medium" variant="filled"
                                                    icon={<ExclamationCircleIcon height={18} style={{ marginLeft: '6px', color: alpha(teal[900], 0.7) }} />}
                                                    sx={{ color: teal[900], backgroundColor: alpha(teal[500], 0.15), fontWeight: 500, marginTop: 1, padding: '4px 10px', height: 'auto', '& .MuiChip-label': { py: '3px' } }}
                                                />
                                             </Stack>
                                        </Grid>

                                         {/* --- Disclaimer and Contextual Messages --- */}
                                         <Grid item xs={12} component={motion.div} variants={resultsItemVariants}>
                                            <Stack spacing={1.5} mt={2.5}> {/* Add margin top */}
                                                {/* Low Success Warning */}
                                                {successCategory === 'Low' && (
                                                    <Alert severity="warning" icon={<WarningAmberOutlinedIcon fontSize="inherit" />} sx={{ borderRadius: '12px', backgroundColor: alpha(amber[100], 0.8), border: `1px solid ${amber[300]}` }}>
                                                        <AlertTitle sx={{fontWeight: 600}}>Consider Alternatives</AlertTitle>
                                                        This prediction suggests a lower success likelihood. It may be beneficial to discuss alternative treatment options or adjustments with your healthcare provider.
                                                    </Alert>
                                                )}
                                                {/* Medium Success Note */}
                                                {successCategory === 'Medium' && (
                                                    <Alert severity="info" icon={<SettingsOutlinedIcon fontSize="inherit" />} sx={{ borderRadius: '12px', backgroundColor: alpha(blue[50], 0.8), border: `1px solid ${blue[200]}` }}>
                                                        <AlertTitle sx={{fontWeight: 600}}>Monitor Progress</AlertTitle>
                                                        There's a moderate chance of success. Consistent follow-up and monitoring are recommended.
                                                    </Alert>
                                                )}
                                                 {/* High Success Note */}
                                                 {successCategory === 'High' && (
                                                    <Alert severity="success" icon={<ThumbUpOutlinedIcon fontSize="inherit" />} sx={{ borderRadius: '12px', backgroundColor: alpha(green[100], 0.8), border: `1px solid ${green[300]}` }}>
                                                        <AlertTitle sx={{fontWeight: 600}}>Positive Outlook</AlertTitle>
                                                        The prediction indicates a high likelihood of a positive outcome with this approach.
                                                    </Alert>
                                                )}
                                                {/* General Disclaimer */}
                                                <Alert
                                                    severity="info"
                                                    icon={<InfoOutlinedIcon fontSize="inherit" />}
                                                    sx={{
                                                      borderRadius: '12px',
                                                      backgroundColor: alpha(grey[100], 0.8),
                                                      border: `1px solid ${grey[300]}`
                                                    }}
                                                  >
                                                    <AlertTitle sx={{ fontWeight: 600 }}>Important Note</AlertTitle>
                                                    This prediction is based on historical data and patterns. It is  
                                                    <strong> not</strong> a substitute for professional medical diagnosis or advice. 
                                                    <strong>Always consult with a qualified healthcare provider</strong> for any health concerns or before making any decisions related to your treatment.
                                                  </Alert>
                                            </Stack>
                                         </Grid>

                                    </Grid> {/* Close Results Grid */}
                                </Paper>
                            </motion.div>
                            )}
                        </AnimatePresence>
                    </Stack> {/* Close Main Content Stack */}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default PredictionForm;