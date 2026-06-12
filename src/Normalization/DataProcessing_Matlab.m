%% FTIR Data Processing Script

%% 0. SETTINGS -> can be changed later
ALS_LAMBDA     = 1e6;
ALS_P          = 0.01;
ALS_ITERATIONS = 10;

SG_WINDOW      = 11;
SG_POLYORDER   = 3;
SG_DERIV       = 2;

%% 1. READ CSV
filename_in  = "C:\Users\20241541\OneDrive - TU Eindhoven\Year 2\4CBLW10\TrainingAugmented-EMSA.csv";
filename_out = "C:\Users\20241541\OneDrive - TU Eindhoven\Year 2\4CBLW10\TrainingAugmented-EMSA-NORMALISED.csv";

T = readtable(filename_in, 'VariableNamingRule', 'preserve'); % load all data
labels = T{:, end};
spectra = T{:, 1:end-1};        
headers = T.Properties.VariableNames;
wavenumbers = spectra(1,:);

%% Remove wavenumber row
spectra = spectra(2:end, :);
labels  = labels(2:end);

fprintf('Loaded %d spectra x %d wavenumber points\n', ...
        size(spectra, 1), size(spectra, 2));

%% 2. BASELINE CORRECTION — ALS
fprintf('Applying ALS baseline correction...\n');
spectra_als = zeros(size(spectra));

for i = 1:size(spectra, 1)
    spectra_als(i, :) = als_baseline(spectra(i,:), ALS_LAMBDA, ALS_P, ALS_ITERATIONS); %See function at the bottom
                               
end
spectra_corrected = spectra - spectra_als;  
fprintf('  Done.\n');

%% 3. NORMALISATION — SNV
fprintf('Applying SNV normalisation...\n');
mean_spectra = mean(spectra_corrected, 2);
std = std(spectra_corrected, 0, 2);
spectra_snv = (spectra_corrected - mean_spectra) ./ std;
fprintf('Done.\n');

%% 4. SAVITZKY-GOLAY 2ND DERIVATIVE
fprintf('Applying Savitzky-Golay 2nd derivative (window=%d, poly=%d)...\n', ...
        SG_WINDOW, SG_POLYORDER);

spectra_proc = sgolayfilt(spectra_snv, SG_POLYORDER, SG_WINDOW, [], SG_DERIV);
% Custom function in matlab, probably need package in python

fprintf('Done.\n');

%% 5. VISUALISE
idx = randperm(size(spectra,1), 100);
% For visualisation dont use all 3000 points but for example 100

colors = [0.27 0.51 0.71;
          0.84 0.24 0.24];

figure('Units','normalized','Position',[0.05 0.2 0.9 0.55]);

%% RAW SPECTRA 
subplot(1, 2, 1);
hold on;

for k = 1:length(idx)
    i = idx(k);

    cls = round(labels(i)) + 1;

    if cls < 1 || cls > size(colors,1)
        continue
    end

    plot(wavenumbers, spectra(i,:), ...
        'Color', [colors(cls,:) 0.25], ...
        'LineWidth', 0.6);

end

set(gca, 'XDir', 'reverse'); % FTIR convention (high -> low wavenumber)
title('Raw FTIR spectra');
xlabel('Wavenumber (cm^{-1})');
ylabel('Absorbance');

legend([ ...
    plot(nan, nan, 'Color', colors(1,:)), ...
    plot(nan, nan, 'Color', colors(2,:))], ...
    {'No diabetes (0)', 'Diabetes (1)'}, ...
    'Location', 'best');
grid on
hold off;

%% PROCESSED SPECTRA 
subplot(1, 2, 2);
hold on;

for k = 1:length(idx)
    i = idx(k);

    cls = round(labels(i)) + 1;

    if cls < 1 || cls > size(colors,1)
        continue
    end

    plot(wavenumbers, spectra_proc(i,:), ...
        'Color', [colors(cls,:) 0.25], ...
        'LineWidth', 0.6);

end

set(gca, 'XDir', 'reverse'); % FTIR standard
title('Processed spectra (ALS + SNV + SG derivative)');
xlabel('Wavenumber (cm^{-1})');
ylabel('Signal (a.u.)');

legend([ ...
    plot(nan, nan, 'Color', colors(1,:)), ...
    plot(nan, nan, 'Color', colors(2,:))], ...
    {'No diabetes (0)', 'Diabetes (1)'}, ...
    'Location', 'best');
grid on
hold off;

%%  SAVE FIGURE
[out_folder, ~, ~] = fileparts(filename_in);
saveas(gcf, fullfile(out_folder, 'ftir_spectra_comparison.png'));

fprintf('Plot saved.\n');

%% 6. SAVE CSV
T_out = array2table([spectra_proc, double(labels)], ...
        'VariableNames', headers); 
writetable(T_out, filename_out);
fprintf('Saved processed data to "%s"\n', filename_out);


%% ALS baseline function

function baseline = als_baseline(y, lam, p, n_iter)
    y  = y(:);
    L  = length(y);
    D  = diff(speye(L), 2);
    D  = lam * (D' * D);
    w  = ones(L, 1);
    for iter = 1:n_iter
        W        = spdiags(w, 0, L, L);
        baseline = (W + D) \ (w .* y);
        w        = p * (y > baseline) + (1 - p) * (y <= baseline);
    end
    baseline = baseline';
end