-- SQL migration: Add ON DELETE CASCADE to all user-related foreign keys
-- Please review and run these statements in your MySQL database (after backup!)

-- Notification
ALTER TABLE notifications DROP FOREIGN KEY fk_notification_user;
ALTER TABLE notifications ADD CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE;

-- FileMetadata
ALTER TABLE file_metadata DROP FOREIGN KEY fk_filemetadata_user;
ALTER TABLE file_metadata ADD CONSTRAINT fk_filemetadata_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE;

-- Appointment
ALTER TABLE appointments DROP FOREIGN KEY fk_appointment_doctor;
ALTER TABLE appointments ADD CONSTRAINT fk_appointment_doctor FOREIGN KEY (doctor_id) REFERENCES doctor(id) ON DELETE CASCADE;
ALTER TABLE appointments DROP FOREIGN KEY fk_appointment_patient;
ALTER TABLE appointments ADD CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE;

-- MedicalRecord
ALTER TABLE medical_records DROP FOREIGN KEY fk_medicalrecord_patient;
ALTER TABLE medical_records ADD CONSTRAINT fk_medicalrecord_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE;
ALTER TABLE medical_records DROP FOREIGN KEY fk_medicalrecord_doctor;
ALTER TABLE medical_records ADD CONSTRAINT fk_medicalrecord_doctor FOREIGN KEY (doctor_id) REFERENCES doctor(id) ON DELETE CASCADE;

-- Review
ALTER TABLE reviews DROP FOREIGN KEY fk_review_patient;
ALTER TABLE reviews ADD CONSTRAINT fk_review_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE;
ALTER TABLE reviews DROP FOREIGN KEY fk_review_doctor;
ALTER TABLE reviews ADD CONSTRAINT fk_review_doctor FOREIGN KEY (doctor_id) REFERENCES doctor(id) ON DELETE CASCADE;

